import parula from '@isrd-isi-edu/deriva-webapps/src/assets/colors/parula.json';
import viridis from '@isrd-isi-edu/deriva-webapps/src/assets/colors/viridis.json';

import { useEffect, useState, useRef, useCallback, SetStateAction, Dispatch } from 'react';

import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import {
  generateRainbowColor,
  generateScale,
  getColor,
} from '@isrd-isi-edu/deriva-webapps/src/utils/colors';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

import { MatrixConfig, MatrixDefaultConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';

/**
 * The x, y, or z axis datum to be parsed
 */
export type MatrixDatum = {
  /**
   * id of each data point
   */
  id: string;
  /**
   * title of each data point
   */
  title: string;
};

/**
 * The xyz datum to be parsed
 */
export type MatrixXYZDatum = {
  /**
   * xid of each data point
   */
  xid: string;
  /**
   * yid of each data point
   */
  yid: string;
  /**
   * array of zid of each data point
   */
  zid: Array<string>;
};

export type MatrixTreeDatum = {
  parent_id: string;
  child_id: string;
}

/**
 * Resolved response from Matrix API request
 */
export type MatrixResponse = [
  /**
   * X data points
   */
  { data: Array<MatrixDatum> },
  /**
   * Y data points
   */
  { data: Array<MatrixDatum> },
  /**
   * Z data points
   */
  { data: Array<MatrixDatum> },
  /**
   * XYZ data points
   */
  { data: Array<MatrixXYZDatum> },
  /**
   * Y tree data
   */
  { data: Array<MatrixTreeDatum> }
];

/**
 * Parsed data point for grid
 */
export type ParsedGridDatum = {
  /**
   * id of a grid cell data point
   */
  id: string;
  /**
   * title of a grid cell data point
   */
  title: string;
  /**
   * link of a grid cell data point
   */
  link?: string;
};

export type LegendDatum = ParsedGridDatum & {
  /**
   * corresponding color on the legend
   * */
  colorIndex: number;
};

/**
 * Parsed cell data for grid
 */
export type ParsedGridCell = ParsedGridDatum & {
  /**
   * the row-wise data point
   */
  row: ParsedGridDatum;
  /**
   * the column-wise data point
   */
  column: ParsedGridDatum;
  /**
   * array of color indices that correspond to a colormap
   */
  colors: Array<number>;
};

/**
 * Grid map data used to search rows and columns
 */
export type GridDataMap = {
  /**
   * unique identifier for grid row or column
   */
  [key: string]: {
    /**
     * corresponding type of grid row or column
     */
    type: 'row' | 'col';
    /**
     * index on the row or column
     */
    index: number;
  };
};

type MatrixData = {
  /**
   * Chaise errors caught during config, fetch and parse
   */
  errors: Array<any>;
  /**
   * Parsed matrix data
   */
  matrixData: ParsedMatrixData | null;
  /**
   * Available color options to select
   */
  colorOptions: Array<Option>;
  /**
   * Currently selected color option
   */
  colorThemeOption: Option;
  /**
   * Set color option function
   */
  setColorThemeOption: Dispatch<SetStateAction<Option>>;
  /**
   * Color scale that changes when color option is changed
   */
  colorScaleMap: Array<string> | null;
  /**
   * matrix configurations
   */
  config: MatrixDefaultConfig | null;
};

/**
 * Selectable color options for the matrix
 */
const colorOptions: Array<Option> = [
  { value: 'default', label: 'Default' },
  { value: 'parula', label: 'Parula' },
  { value: 'viridis', label: 'Viridis' },
];

/**
 * Hook function to use matrix data given a config object
 *
 * @param matrixConfigs
 * @returns all data to be used by matrix visualization
 */
export const useMatrixData = (matrixConfigs: MatrixConfig): MatrixData => {
  const { dispatchError, errors } = useError();
  /**
   * config object state
   */
  const [config, setConfig] = useState<MatrixDefaultConfig | null>(null);
  /**
   * raw data request from the api
   */
  const [data, setData] = useState<MatrixResponse | null>(null);
  /**
   * parsed matrix data that goes into the matrix props
   */
  const [matrixData, setMatrixData] = useState<ParsedMatrixData | null>(null);
  /**
   * colormap scale that maps index to rgb
   */
  const [colorScaleMap, setColorScaleMap] = useState<Array<string> | null>(null);
  /**
   * selected color theme of grid
   */
  const [colorThemeOption, setColorThemeOption] = useState<Option>(colorOptions[0]);

  const setupStarted = useRef<boolean>(false);

  /**
   * Creates a color scale array map used to be passed to components where the key is the index
   */
  const createColorScaleArrayMap = useCallback(
    (data: MatrixResponse) => {
      // choose theme color based on state provided
      const [, , { data: zData }] = data;
      let colorScale: Array<Array<number>>;
      if (colorThemeOption.value === 'parula') {
        colorScale = generateScale(parula);
      } else if (colorThemeOption.value === 'viridis') {
        colorScale = generateScale(viridis);
      } else {
        colorScale = [];
      }

      // create resulting color map
      const result = zData.map((_z: MatrixDatum, i: number) => {
        if (colorThemeOption.value !== 'parula' && colorThemeOption.value !== 'viridis') {
          return generateRainbowColor(zData.length, i);
        } else {
          return getColor(colorScale, zData.length, i);
        }
      });
      return result;
    },
    [colorThemeOption.value]
  );

  // Side Effect for Updating Data
  useEffect(() => {
    const fetchMatrixData = async (config: MatrixDefaultConfig) => {
      const xPromise = ConfigService.http.get(config.xURL);
      const yPromise = ConfigService.http.get(config.yURL);

      let yTreePromise;
      if (config.yTreeURL) {
        yTreePromise = ConfigService.http.get(config.yTreeURL);
      } else {
        yTreePromise = new Promise((resolve) => resolve({data: {}}));
      }

      const zPromise = ConfigService.http.get(config.zURL);
      const xyzPromise = ConfigService.http.get(config.xysURL);

      // Batch the requests in Promise.all so they can run in parallel:
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise, yTreePromise]);
      const parsedData = parseMatrixData(config, data);

      // Set state after the request completes
      setData(data);
      setMatrixData(parsedData);
      setConfig(config);
    };

    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(matrixConfigs);
      fetchMatrixData(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [matrixConfigs, dispatchError, createColorScaleArrayMap]);

  // Side Effect for Updating Color Scale
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const newColorScaleMap = createColorScaleArrayMap(data);
      setColorScaleMap(newColorScaleMap);
    }
  }, [data, colorThemeOption.value, createColorScaleArrayMap]);

  return {
    errors,
    matrixData,
    colorOptions,
    colorThemeOption,
    setColorThemeOption,
    colorScaleMap,
    config,
  };
};

/**
 * Data to be passed to the grid component
 */
export type ParsedMatrixData = {
  gridData: Array<Array<ParsedGridCell>>;
  legendData: Array<LegendDatum>;
  gridDataMap: GridDataMap;
  options: Array<Option>;
};

/**
 * Parses the response data into several parts that will become usable by the Matrix Visualization
 * Component.
 *
 * @param config the configs for matrices
 * @param response the response for all data received from the server
 * @returns parsed data used by matrix visualization component
 */
const parseMatrixData = (config: MatrixDefaultConfig, response: MatrixResponse): ParsedMatrixData => {
  const [{ data: xData }, { data: yData }, { data: zData }, { data: xyzData }, { data: yTreeData } ] = response;

  /**
   * TODO Junmeng
   *
   * this function is responsible for turning the data that we get from server (the json files under local-test in your case)
   * into the data structure that we expect for the grid.
   *
   * `yTreeData` is the returned tree data. be mindful that this value is optional.
   * so if it won't make your code more difficult, you should switch to the existing behavior
   * when `yTreeData` is not available.
   */

  // Create XYZ Map
  const xyzMap: any = {};
  xyzData.forEach((xyz: MatrixXYZDatum) => {
    if (!xyzMap[xyz.xid]) {
      xyzMap[xyz.xid] = {};
    }
    const zSet = new Set(xyz.zid);
    xyzMap[xyz.xid][xyz.yid] = Array.from(zSet)
      .map((str) => str.toLowerCase())
      .sort();
  });

  // Create Color Map and Create Legend Data
  const colorMap: { [zTitle: string]: number } = {};
  const legendData: Array<LegendDatum> = [];
  zData.forEach((z: MatrixDatum, i: number) => {
    colorMap[z.title.toLowerCase()] = i;

    legendData.push({
      id: z.id,
      colorIndex: i,
      title: z.title,
      link: generateLink(config, null, null, z),
    });
  });

  // Create Parsed Grid Data
  const gridData: Array<Array<ParsedGridCell>> = [];
  yData.forEach((y: MatrixDatum, row: number) => {
    // Parse Rows
    const yParse: ParsedGridDatum = {
      id: y.id,
      title: y.title,
      link: generateLink(config, null, y),
    };

    const gridRow: Array<ParsedGridCell> = [];
    xData.forEach((x: MatrixDatum) => {
      // Parse Columns
      const xParse: ParsedGridDatum = {
        id: x.id,
        title: x.title,
        link: generateLink(config, x),
      };

      let cellLink = '';
      const cellColors: Array<number> = [];
      if (xyzMap[x.id] && xyzMap[x.id][y.id]) {
        const currZ = xyzMap[x.id][y.id];
        cellLink = generateLink(config, x, y);
        currZ.forEach((zTitle: string) => {
          cellColors.push(colorMap[zTitle]);
        });
      }

      const cellId = `${x.id} + ${y.id}`;
      const cellTitle = `${x.title} + ${y.title}`;

      gridRow.push({
        row: yParse,
        column: xParse,
        id: cellId,
        title: cellTitle,
        link: cellLink,
        colors: cellColors,
      });
    });

    // Add empty column at last of each row as a margin
    gridRow.push({
      row: { id: y.id, title: '', link: '' },
      column: { id: String(xData.length), title: '', link: '' },
      id: `${y.id}-${row}-${xData.length}`,
      title: '',
      link: '',
      colors: [],
    });
    gridData.push(gridRow);
  });

  // Add empty row as a margin
  const emptyRow: Array<ParsedGridCell> = xData.map((x: MatrixDatum, col: number) => ({
    row: { id: String(yData.length), title: '', link: '' },
    column: { id: x.id, title: '', link: '' },
    id: `${x.id}-${col}-${yData.length}`,
    title: '',
    link: '',
    colors: [],
  }));
  // add last corner cell
  emptyRow.push({
    row: { id: String(yData.length), title: '', link: '' },
    column: { id: String(xData.length), title: '', link: '' },
    id: `${xData.length}-${yData.length}`,
    title: '',
    link: '',
    colors: [],
  });
  gridData.push(emptyRow);

  // Create the options and datamap used for the matrix search feature
  const options: Array<Option> = [];
  const gridDataMap: GridDataMap = {};
  yData.forEach((y: MatrixDatum, row: number) => {
    options.push({ value: y.id, label: y.title });
    gridDataMap[y.title.toLowerCase()] = { type: 'row', index: row };
  });
  xData.forEach((x: MatrixDatum, col: number) => {
    options.push({ value: x.id, label: x.title });
    gridDataMap[x.title.toLowerCase()] = { type: 'col', index: col };
  });

  const parsedData: ParsedMatrixData = {
    gridData,
    legendData,
    gridDataMap,
    options,
  };

  return parsedData;
};

/**
 * Generate a link for combination of x and y filter on the main table
 * @param  {object} x the x object, must have .title and .id
 * @param  {object} y the y object, must have .title and .id
 * @return {string} returns the url string to be used
 */
const generateLink = (config: MatrixDefaultConfig, x?: any, y?: any, z?: any) => {
  const facetList = [];
  if (x) {
    facetList.push({ source: config.xSource, choices: [x[config.xFacetColumn]] });
  }
  if (y) {
    facetList.push({ source: config.ySource, choices: [y[config.yFacetColumn]] });
  }
  if (z) {
    facetList.push({ source: config.zSource, choices: [z[config.zFacetColumn]] });
  }
  // creat a path that chaise understands
  const path = ConfigService.ERMrest.createPath(
    config.catalogId,
    config.schemaName,
    config.tableName,
    {
      and: facetList,
    }
  );

  // create the url to open
  return '/' + ['chaise', 'recordset', path].join('/');
};
