import { useEffect, useState, useRef, useCallback } from 'react';

import parula from '@isrd-isi-edu/deriva-webapps/src/assets/parula.json';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import {
  generateRainbowColor,
  generateScale,
  getColor,
} from '@isrd-isi-edu/deriva-webapps/src/utils/colors';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

type MatrixDatum = {
  id: string;
  title: string;
};

type MatrixXYZDatum = {
  xid: string;
  yid: string;
  zid: Array<string>;
};

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
  const gridData = yData.map((y: MatrixDatum) => {
    // Parse Rows
    const yParse = {
      id: y.id,
      title: y.title,
      link: generateLink(config, null, y),
    };

    return xData.map((x: MatrixDatum) => {
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

      return {
        row: yParse,
        column: xParse,
        id: cellId,
        title: cellTitle,
        link: cellLink,
        colors: cellColors,
      };
    });
  });

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

export const useMatrixData = (matrixConfigs: any) => {
  const { dispatchError, errors } = useError();
  const [data, setData] = useState<any>(null);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [colorScaleMap, setColorScaleMap] = useState<any>(null);
  const [colorBlindOption, setColorBlindOption] = useState<any>(false);

  const setupStarted = useRef<boolean>(false);

  const createColorScaleArrayMap = useCallback(
    (data: any) => {
      const [, , { data: zData }] = data;
      const colorScale = generateScale(parula);
      const result = zData.map((_z: any, i: number) =>
        !colorBlindOption
          ? generateRainbowColor(zData.length, i)
          : getColor(colorScale, zData.length, i)
      );
      return result;
    },
    [colorBlindOption]
  );

  // Side Effect for Updating Data
  useEffect(() => {
    const fetchMatrixData = async (config: any) => {
      // Request data
      const xPromise = ConfigService.http.get(config.xURL);
      const yPromise = ConfigService.http.get(config.yURL);
      const zPromise = ConfigService.http.get(config.zURL);
      const xyzPromise = ConfigService.http.get(config.xysURL);
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise]);
      const parsedData = parseMatrixData(config, data);
      setData(data);
      setMatrixData(parsedData);
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
  }, [data, colorBlindOption, createColorScaleArrayMap]);

  return {
    dispatchError,
    errors,
    matrixData,
    setMatrixData,
    setupStarted,
    colorBlindOption,
    setColorBlindOption,
    colorScaleMap,
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
