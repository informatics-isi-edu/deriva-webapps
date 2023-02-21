import parula from '@isrd-isi-edu/deriva-webapps/src/assets/parula.json';
import viridis from '@isrd-isi-edu/deriva-webapps/src/assets/viridis.json';

import { useEffect, useState, useRef, useCallback } from 'react';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import {
  generateRainbowColor,
  generateScale,
  getColor,
} from '@isrd-isi-edu/deriva-webapps/src/utils/colors';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// The x, y, or z axis datum to be parsed
type MatrixDatum = {
  id: string;
  title: string;
};

// The xyz datum to be parsed
type MatrixXYZDatum = {
  xid: string;
  yid: string;
  zid: Array<string>;
};

/**
 * Parses the response data into several parts that will become usable by the Matrix Visualization
 * Component.
 *
 * @param config the configs for matrices
 * @param response the response for all data received from the server
 * @returns parsed data used by matrix visualization component
 */
const parseMatrixData = (config: any, response: any): any => {
  const [{ data: xData }, { data: yData }, { data: zData }, { data: xyzData }] = response;

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
  const legendData: Array<any> = [];
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
  const gridData: any = [];
  yData.forEach((y: MatrixDatum, row: number) => {
    // Parse Rows
    const yParse = {
      id: y.id,
      title: y.title,
      link: generateLink(config, null, y),
    };

    const gridRow: any = [];
    xData.forEach((x: MatrixDatum, col: number) => {
      // Parse Columns
      const xParse = {
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
      column: { id: xData.length, title: '', link: '' },
      id: `${y.id}-${row}-${xData.length}`,
      title: '',
      link: '',
      colors: [],
    });
    gridData.push(gridRow);
  });

  // Add empty row as a margin
  const emptyRow = xData.map((x: any, col: number) => ({
    row: { id: yData.length, title: '', link: '' },
    column: { id: x.id, title: '', link: '' },
    id: `${x.id}-${col}-${yData.length}`,
    title: '',
    link: '',
    colors: [],
  }));
  // add last corner cell
  emptyRow.push({
    row: { id: yData.length, title: '', link: '' },
    column: { id: xData.length, title: '', link: '' },
    id: `${xData.length}-${yData.length}`,
    title: '',
    link: '',
    colors: [],
  });
  gridData.push(emptyRow);

  // Create the options and datamap used for the matrix search feature
  const options: Array<any> = [];
  const gridDataMap: any = {};
  yData.forEach((y: MatrixDatum, row: number) => {
    options.push({ value: y.id, label: y.title });
    gridDataMap[y.title.toLowerCase()] = { type: 'row', index: row };
  });
  xData.forEach((x: MatrixDatum, col: number) => {
    options.push({ value: x.id, label: x.title });
    gridDataMap[x.title.toLowerCase()] = { type: 'col', index: col };
  });

  const parsedData: any = {
    gridData,
    legendData,
    gridDataMap,
    options,
  };

  return parsedData;
};

// Selectable color options for the matrix
const colorOptions = [
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
export const useMatrixData = (matrixConfigs: any) => {
  const { dispatchError, errors } = useError();
  const [styles, setStyles] = useState<any>(null); // styles from the config object
  const [data, setData] = useState<any>(null); // raw data request from the api
  const [matrixData, setMatrixData] = useState<any>(null); // parsed matrix data that goes into the matrix props
  const [colorScaleMap, setColorScaleMap] = useState<Array<string> | null>(null); // colormap scale that maps index to rgb
  const [colorThemeOption, setColorThemeOption] = useState<any>(colorOptions[0]); // selected color theme of grid

  const setupStarted = useRef<boolean>(false);

  /**
   * Creates a color scale array map used to be passed to components where the key is the index
   */
  const createColorScaleArrayMap = useCallback(
    (data: any) => {
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
      const result = zData.map((_z: any, i: number) => {
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
    const fetchMatrixData = async (config: any) => {
      const xPromise = ConfigService.http.get(config.xURL);
      const yPromise = ConfigService.http.get(config.yURL);
      const zPromise = ConfigService.http.get(config.zURL);
      const xyzPromise = ConfigService.http.get(config.xysURL);

      // Batch the requests in Promise.all so they can run in parallel:
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise]);
      const parsedData = parseMatrixData(config, data);

      // Set state after the request completes
      setData(data);
      setMatrixData(parsedData);
      setStyles(config.styles);
    };

    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(matrixConfigs);
      fetchMatrixData(config);
    } catch (error: any) {
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
    dispatchError,
    errors,
    matrixData,
    setMatrixData,
    setupStarted,
    colorOptions,
    colorThemeOption,
    setColorThemeOption,
    colorScaleMap,
    styles,
  };
};

/**
 * Generate a link for combination of x and y filter on the main table
 * @param  {object} x the x object, must have .title and .id
 * @param  {object} y the y object, must have .title and .id
 * @return {string} returns the url string to be used
 */
const generateLink = (config: any, x?: any, y?: any, z?: any) => {
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
