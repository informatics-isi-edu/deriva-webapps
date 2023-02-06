import { useEffect, useState, useRef } from 'react';

import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

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

export const useMatrixData = (matrixConfigs: any) => {
  const { dispatchError, errors } = useError();
  const [matrixData, setMatrixData] = useState<any>(null);
  const setupStarted = useRef<boolean>(false);
  useEffect(() => {
    const fetchMatrixData = async (config: any) => {
      // Request data
      const xPromise = ConfigService.http.get(config.xURL);
      const yPromise = ConfigService.http.get(config.yURL);
      const zPromise = ConfigService.http.get(config.zURL);
      const xyzPromise = ConfigService.http.get(config.xysURL);
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise]);

      const [{ data: xData }, { data: yData }, { data: zData }, { data: xyzData }] = data;

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
      const colorMap: { [zTitle: string]: string } = {};
      const legendData: Array<any> = [];
      zData.forEach((z: MatrixDatum, i: number) => {
        const currentColor = generateColor(zData.length, i);
        colorMap[z.title.toLowerCase()] = currentColor;

        legendData.push({
          id: z.id,
          color: currentColor,
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
          const cellColors: Array<string> = [];
          if (xyzMap[x.id] && xyzMap[x.id][y.id]) {
            const currZ = xyzMap[x.id][y.id];
            cellLink = generateLink(config, x, y);
            currZ.forEach((zTitle: string) => {
              cellColors.push(colorMap[zTitle]);
            });
          }

          return {
            row: yParse,
            column: xParse,
            id: `${x.id} + ${y.id}`,
            title: `${x.title} + ${y.title}`,
            link: cellLink,
            colors: cellColors,
          };
        });
      });

      const parsedData: any = {
        gridData,
        legendData,
      };

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
  }, []);

  return { dispatchError, errors, matrixData, setMatrixData, setupStarted };
};

/**
 * @desc Generates specified number of rainbow colors.
 * from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * @param  {integer} len  Number of colors.
 * @return {Array} An Array of colors (string) in the rgb('r','g','b') format
 */
const generateColor = (len: number, i: number) => {
  const frequency = 5 / len;
  const r = Math.floor(Math.sin(frequency * i) * 127 + 128);
  const g = Math.floor(Math.sin(frequency * i + 2) * 127 + 128);
  const b = Math.floor(Math.sin(frequency * i + 4) * 127 + 128);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
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
