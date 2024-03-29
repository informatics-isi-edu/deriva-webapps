import parula from '@isrd-isi-edu/deriva-webapps/src/assets/colors/parula.json';
import viridis from '@isrd-isi-edu/deriva-webapps/src/assets/colors/viridis.json';

import { useEffect, useState, useRef, useCallback, SetStateAction, Dispatch } from 'react';

import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

import { getConfigObject } from '@isrd-isi-edu/chaise/src/utils/config';
import {
  generateRainbowColor,
  generateScale,
  getColor,
} from '@isrd-isi-edu/deriva-webapps/src/utils/colors';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

import { MatrixColorPalletes, MatrixConfig, MatrixDefaultConfig } from '@isrd-isi-edu/deriva-webapps/src/models/matrix-config';
import { Displayname } from '@isrd-isi-edu/chaise/src/models/displayname';

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

/**
 * The tree datum to be parsed
 */
export type MatrixTreeDatum = {
  /**
   * y/x id of parent data point
   */
  parent_id: string;
  /**
   * y/x id of child data point
   */
  child_id: string;
};

/**
 * The tree node datum to be parsed
 */
export type TreeNode = {
  title: string;
  key: string;
  link?: string;
  children: TreeNode[];
};

/**
 * The tree node datum dictionary to be parsed
 */
export type TreeNodeMap = {
  [key: string]: TreeNode;
};

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
  { data: Array<MatrixTreeDatum> },
  /**
   * X tree data
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
  colors?: Array<number>;
  /**
   * if defined, we will show it in the cell
   */
  displayValue?: Displayname
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
     * id on the row or column
     */
    id: string;
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
const defaultColorOptions: Array<Option> = [
  { value: MatrixColorPalletes.RAINBOW, label: MatrixColorPalletes.RAINBOW },
  { value: MatrixColorPalletes.PARULA, label: MatrixColorPalletes.PARULA },
  { value: MatrixColorPalletes.VIRDIDIS, label: MatrixColorPalletes.VIRDIDIS }
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
  const [colorThemeOption, setColorThemeOption] = useState<Option>(defaultColorOptions[0]);

  const [colorOptions, setColorOptions] = useState<Option[]>(defaultColorOptions);

  const setupStarted = useRef<boolean>(false);

  /**
   * Creates a color scale array map used to be passed to components where the key is the index
   */
  const createColorScaleArrayMap = useCallback(
    (data: MatrixResponse) => {
      // choose theme color based on state provided
      const [, , { data: zData }] = data;
      let colorScale: Array<Array<number>>;
      if (colorThemeOption.value === MatrixColorPalletes.PARULA) {
        colorScale = generateScale(parula);
      } else if (colorThemeOption.value === MatrixColorPalletes.VIRDIDIS) {
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
      const xPromise = ConfigService.http.get(config.x_url);
      const yPromise = ConfigService.http.get(config.y_url);

      let yTreePromise;
      if (config.y_tree_url) {
        yTreePromise = ConfigService.http.get(config.y_tree_url);
      } else {
        yTreePromise = new Promise((resolve) => resolve({ data: {} }));
      }

      let xTreePromise;
      if (config.x_tree_url) {
        xTreePromise = ConfigService.http.get(config.x_tree_url);
      } else {
        xTreePromise = new Promise((resolve) => resolve({ data: {} }));
      }

      const zPromise = config.z_url ? ConfigService.http.get(config.z_url) : new Promise((resolve) => resolve({ data: [] }));
      const xyzPromise = ConfigService.http.get(config.xys_url);

      // Batch the requests in Promise.all so they can run in parallel:
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise, yTreePromise, xTreePromise]);
      const parsedData = parseMatrixData(config, data);

      // modify color palette state variables
      if (config.color_palette) {
        let defaultOption = defaultColorOptions[0].value;
        if (config.color_palette.default_option && colorPalleteIsValid(config.color_palette.default_option)) {
          defaultOption = config.color_palette.default_option;
          setColorThemeOption({ value: config.color_palette.default_option, label: config.color_palette.default_option });
        }

        if (Array.isArray(config.color_palette.options)) {
          let hasDefaultOption = false;
          const validColors = config.color_palette.options.filter(v => colorPalleteIsValid(v)).map(v => {
            if (v === defaultOption) hasDefaultOption = true;
            return { value: v, label: v };
          });

          // if the default option is not one of the options, add it.
          if (!hasDefaultOption) {
            validColors.unshift({ value: defaultOption as MatrixColorPalletes, label: defaultOption as MatrixColorPalletes });
          }
          setColorOptions(validColors);
        }
      }

      // Set state after the request completes
      setData(data);
      setMatrixData(parsedData);
      setConfig(config);
    };

    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      // TODO proper type for config object
      const config = getConfigObject(matrixConfigs as any) as any;
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
  yTreeData?: Array<MatrixTreeDatum>;
  yTreeNodes?: TreeNode[];
  yTreeNodesMap?: TreeNodeMap;
  xTreeData?: Array<MatrixTreeDatum>;
  xTreeNodes?: TreeNode[];
  xTreeNodesMap?: TreeNodeMap;
  legendData: Array<LegendDatum>;
  gridDataMap: GridDataMap;
  options: Array<Option>;
  hasColor: boolean;
  yDataMaxLength: number;
  xDataMaxLength: number;
};

/**
 * Flatten the nodes in a tree structure to a flatList
 */
const flattenTree = (tree: TreeNode[], flatList: string[] = []): string[] => {
  tree.forEach((node) => {
    flatList.push(node.key);
    if (Array.isArray(node.children)) {
      flattenTree(node.children, flatList);
    }
  });
  return flatList;
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
  const [{ data: xData }, { data: yData }, { data: zData }, { data: xyzData }, { data: yTreeData }, { data: xTreeData },] = response;

  /**
   * 'yTreeData' and 'xTreeData' are the returned tree data. these values are optional.
   * Corresponding component will switch to the existing behavior when 'xTreeData' or 'yTreeData' is not available.
   */

  let hasColor = false;

  // Create XYZ Map
  const xyzMap: any = {};
  xyzData.forEach((xyz: MatrixXYZDatum) => {
    if (!xyzMap[xyz.xid]) {
      xyzMap[xyz.xid] = {};
    }
    const zSet = new Set(xyz.zid);
    xyzMap[xyz.xid][xyz.yid] = {
      zs: Array.from(zSet).map((str) => str.toLowerCase()).sort(),
      // used for the patterns that might be defined for the url or the cell value
      values: { ...xyz }
    }
  });

  // Create Color Map and Create Legend Data
  const colorMap: { [zTitle: string]: number } = {};
  const legendData: Array<LegendDatum> = [];
  zData.forEach((z: MatrixDatum, i: number) => {
    colorMap[z.title.toLowerCase()] = i;

    let link = '';
    if (canGenerateLink(config, false, false, true, false)) {
      link = config.z_link_pattern ? generateLinkWithPattern(config.z_link_pattern, z) : generateLinkWithFacets(config, null, null, z);
    }

    legendData.push({
      id: z.id,
      colorIndex: i,
      title: z.title,
      link,
    });
  });

  // Create Parsed Grid Data
  const gridData: Array<Array<ParsedGridCell>> = [];
  yData.forEach((y: MatrixDatum, row: number) => {
    let link = '';
    if (canGenerateLink(config, false, true, false, false)) {
      link = config.y_link_pattern ? generateLinkWithPattern(config.y_link_pattern, y) : generateLinkWithFacets(config, null, y);
    }

    // Parse Rows
    const yParse: ParsedGridDatum = {
      id: y.id,
      title: y.title,
      link,
    };

    const gridRow: Array<ParsedGridCell> = [];
    xData.forEach((x: MatrixDatum) => {
      // add link for x axis
      let link = '';
      if (canGenerateLink(config, false, true, false, false)) {
        link = config.x_link_pattern ? generateLinkWithPattern(config.x_link_pattern, x) : generateLinkWithFacets(config, x);
      }

      // Parse Columns
      const xParse: ParsedGridDatum = {
        id: x.id,
        title: x.title,
        link,
      };

      let cellLink = '';
      const cellColors: Array<number> = [];
      let cellValue: Displayname | undefined;
      if (xyzMap[x.id] && xyzMap[x.id][y.id]) {
        const currZ = xyzMap[x.id][y.id];

        // generate the link for cells
        if (canGenerateLink(config, false, false, false, true)) {
          cellLink = config.xys_link_pattern ? generateLinkWithPattern(config.xys_link_pattern, currZ.values) : generateLinkWithFacets(config, x, y);
        }

        // generate the cell value
        if (config.xys_markdown_pattern) {
          cellValue = generateCellDisplayValue(config.xys_markdown_pattern, currZ.values);
        }

        // find the colors for cell
        if (Array.isArray(currZ.zs) && currZ.zs.length > 0) {
          hasColor = true;
          currZ.zs.forEach((zTitle: string) => {
            cellColors.push(colorMap[zTitle]);
          });
        }
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
        displayValue: cellValue
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

  /**
   * TODO
   * Only for non-tree headers, for the condition that we expect its scrollable max width or height to be auto.
   * Current solution is that, the component width or height is calculated by font size and characters.
   * In the future, improve the solution or try other solutions.
   */
  // Find the max length of titles for both y-axis and x-axis
  let yDataMaxLength = 0;
  let xDataMaxLength = 0;

  // Create the options and datamap used for the matrix search feature
  const options: Array<Option> = [];
  const gridDataMap: GridDataMap = {};
  yData.forEach((y: MatrixDatum) => {
    options.push({ value: y.id, label: y.title });
    gridDataMap[y.title.toLowerCase()] = { type: 'row', id: y.id };

    const titleLength = y.title.length;
    if (titleLength > yDataMaxLength) {
      yDataMaxLength = titleLength;
    }
  });
  xData.forEach((x: MatrixDatum) => {
    options.push({ value: x.id, label: x.title });
    gridDataMap[x.title.toLowerCase()] = { type: 'col', id: x.id };

    const titleLength = x.title.length;
    if (titleLength > xDataMaxLength) {
      xDataMaxLength = titleLength;
    }
  });

  /**
   * Construct tree data and nodes
   */
  // Y tree data
  const yTreeNodes: TreeNode[] = [];
  const yTreeNodesMap: { [key: string]: TreeNode } = {};
  const yReferenceNodesMap: { [key: string]: { title: string, link?: string } } = {};

  // TODO this could be part of the code above
  gridData.forEach((element: ParsedGridCell[]) => {
    if (element[0]['row']['id']) {
      const referenceNode = {
        title: element[0]['row']['title'],
        link: element[0]['row']['link'],
      }
      yReferenceNodesMap[element[0]['row']['id']] = referenceNode;
    }
  });

  if (Object.keys(yTreeData).length !== 0) {
    yTreeData.forEach((item) => {
      const { child_id, parent_id } = item;

      const childTitle = child_id in yReferenceNodesMap ? yReferenceNodesMap[child_id].title : 'None';
      const childLink = child_id in yReferenceNodesMap ? yReferenceNodesMap[child_id].link : '';
      const childNode = child_id in yTreeNodesMap
        ? yTreeNodesMap[child_id]
        : {
          title: childTitle,
          key: child_id,
          link: childLink,
          children: [],
        };

      yTreeNodesMap[child_id] = childNode;

      if (parent_id !== null) {
        const parentTitle = parent_id in yReferenceNodesMap ? yReferenceNodesMap[parent_id].title : 'None';
        const parentLink = parent_id in yReferenceNodesMap ? yReferenceNodesMap[parent_id].link : '';
        const parentNode = parent_id in yTreeNodesMap
          ? yTreeNodesMap[parent_id]
          : {
            title: parentTitle,
            key: parent_id,
            link: parentLink,
            children: [],
          };

        parentNode.children.push(childNode);
        yTreeNodesMap[parent_id] = parentNode;
      }

      if (parent_id === null) {
        yTreeNodes.push(childNode);
      }
    });

    // Sort the gridData in y axis for the synchronization of expand and collapse of tree
    const flatKeys = flattenTree(yTreeNodes);
    gridData.sort((a, b) => {
      return flatKeys.indexOf(a[0].row.id) - flatKeys.indexOf(b[0].row.id);
    });
  }

  // X tree data
  const xTreeNodes: TreeNode[] = [];
  const xTreeNodesMap: { [key: string]: TreeNode } = {};
  const xReferenceNodesMap: { [key: string]: { title: string, link: string } } = {};

  // TODO this could be part of the code above
  xData.forEach((x: MatrixDatum) => {
    // Parse Columns
    const referenceNode = {
      title: x.title,
      link: config.x_link_pattern ? generateLinkWithPattern(config.x_link_pattern, x) : generateLinkWithFacets(config, x)
    }
    xReferenceNodesMap[x.id] = referenceNode;
  });

  if (Object.keys(xTreeData).length !== 0) {
    xTreeData.forEach((item) => {
      const { child_id, parent_id } = item;

      const childTitle = child_id in xReferenceNodesMap ? xReferenceNodesMap[child_id].title : 'None';
      const childLink = child_id in xReferenceNodesMap ? xReferenceNodesMap[child_id].link : '';
      const childNode = child_id in xTreeNodesMap
        ? xTreeNodesMap[child_id]
        : {
          title: childTitle,
          key: child_id,
          link: childLink,
          children: [],
        };

      xTreeNodesMap[child_id] = childNode;

      if (parent_id !== null) {
        const parentTitle = parent_id in xReferenceNodesMap ? xReferenceNodesMap[parent_id].title : 'None';
        const parentLink = parent_id in xReferenceNodesMap ? xReferenceNodesMap[parent_id].link : '';
        const parentNode = parent_id in xTreeNodesMap
          ? xTreeNodesMap[parent_id]
          : {
            title: parentTitle,
            key: parent_id,
            link: parentLink,
            children: [],
          };

        parentNode.children.push(childNode);
        xTreeNodesMap[parent_id] = parentNode;
      }

      if (parent_id === null) {
        xTreeNodes.push(childNode);
      }
    });

    // Sort the gridData in y axis for the synchronization of expand and collapse of tree
    const flatKeys = flattenTree(xTreeNodes);

    // Sort each row in gridData based on the order of cell ids
    gridData.forEach((gridRow) => {
      gridRow.sort((a, b) => {
        return flatKeys.indexOf(a.column.id) - flatKeys.indexOf(b.column.id);
      });
    });
  }

  if (Object.keys(xTreeData).length !== 0) {
    // Shift the empty cell to the last
    gridData.forEach((gridRow) => {
      const firstElement = gridRow.shift(); // Remove the first element
      if (firstElement) {
        gridRow.push(firstElement);
      }
    });
  }

  // Add the empty row to the last
  gridData.push(emptyRow);

  // Return the required data based on whether xTreeData or yTreeData exists
  const parsedData: ParsedMatrixData = {
    gridData,
    ...yTreeData.length > 0 && {
      yTreeData,
      yTreeNodes,
      yTreeNodesMap
    },
    ...xTreeData.length > 0 && {
      xTreeData,
      xTreeNodes,
      xTreeNodesMap,
    },
    legendData,
    gridDataMap,
    options,
    hasColor,
    yDataMaxLength,
    xDataMaxLength,
  };
  return parsedData;
};

/**
 * whether the proper combiniation of properties are available to generate a link or not.
 * @param config the config object
 * @param isX whether we're doing this for x axis
 * @param isY whether we're doing this for y axis
 * @param isZ whether we're doing this for z axis
 * @param isCell whether we're doing this for cell
 * @returns
 */
const canGenerateLink = (config: MatrixDefaultConfig, isX: boolean, isY: boolean, isZ: boolean, isCell: boolean): boolean => {
  const hasTable = config.catalog_id && config.schema_name && config.table_name;
  if (isX) {
    return !!config.x_link_pattern || !!(hasTable && config.x_source && config.x_facet_column);
  }

  if (isY) {
    return !!config.y_link_pattern || !!(hasTable && config.y_source && config.y_facet_column);
  }

  if (isZ) {
    return !!config.z_link_pattern || !!(hasTable && config.z_source && config.z_facet_column);
  }

  if (isCell) {
    return !!config.xys_link_pattern || !!(hasTable && config.y_source && config.y_facet_column && config.x_source && config.x_facet_column);
  }

  return false;
}

/**
 * Generate a link for combination of x and y filter on the main table
 * @param  {object} x the x object, must have .title and .id
 * @param  {object} y the y object, must have .title and .id
 * @return {string} returns the url string to be used
 */
const generateLinkWithFacets = (config: MatrixDefaultConfig, x?: any, y?: any, z?: any) => {
  const facetList = [];
  if (x) {
    facetList.push({ source: config.x_source, choices: [x[config.x_facet_column!]] });
  }
  if (y) {
    facetList.push({ source: config.y_source, choices: [y[config.y_facet_column!]] });
  }
  if (z) {
    facetList.push({ source: config.z_source, choices: [z[config.z_facet_column!]] });
  }
  // creat a path that chaise understands
  const path = ConfigService.ERMrest.createPath(
    config.catalog_id,
    config.schema_name,
    config.table_name,
    {
      and: facetList,
    }
  );

  // create the url to open
  return '/' + ['chaise', 'recordset', path].join('/');
};

/**
 * process a given handlebars pattern
 */
const generateLinkWithPattern = (pattern: string, data: any) => {
  return ConfigService.ERMrest.renderHandlebarsTemplate(pattern, data);
}

/**
 * process a given handlebars markdown_pattern
 */
const generateCellDisplayValue = (pattern: string, data: any) => {
  const res = ConfigService.ERMrest.renderHandlebarsTemplate(pattern, data);

  if (res === null || res.trim() === '') {
    return { isHTML: false, value: '', unformatted: res };
  }

  return { isHTML: true, value: ConfigService.ERMrest.renderMarkdown(res, true), unformatted: res };
}

/**
 * whether a given string is a valid color palette name
 */
const colorPalleteIsValid = (value: string) => {
  return Object.values(MatrixColorPalletes).includes(value as MatrixColorPalletes)
}
