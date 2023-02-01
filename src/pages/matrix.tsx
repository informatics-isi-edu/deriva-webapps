import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Matrix, { MatrixProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/matrix';
import { CellProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/cell';
import { RowProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row';
import { HeaderRowProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/header-row';
import { LegendProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

// services
import $log from '@isrd-isi-edu/chaise/src/services/logger';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

type Config = any;

type MatrixDatum = {
  id: string;
  title: string;
};

type MatrixXYZDatum = {
  xid: string;
  yid: string;
  zid: Array<string>;
};

const MatrixApp = (): JSX.Element => {
  const { dispatchError, errors } = useError();

  const [matrixProps, setMatrixProps] = useState<MatrixProps | null>(null);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);
  useEffect(() => {
    const fetchMatrixData = async (config: Config) => {
      // Request data
      const xPromise = ConfigService.http.get(config.xURL);
      const yPromise = ConfigService.http.get(config.yURL);
      const zPromise = ConfigService.http.get(config.zURL);
      const xyzPromise = ConfigService.http.get(config.xysURL);
      const data = await Promise.all([xPromise, yPromise, zPromise, xyzPromise]);

      const [{ data: xData }, { data: yData }, { data: zData }, { data: xyzData }] = data;

      const colorMap: { [zTitle: string]: string } = {};
      const legendCells: LegendProps['cells'] = [];
      const legendHeaders: HeaderRowProps['headers'] = [];

      const matrixRows: Array<RowProps> = [];
      const matrixHeaders: HeaderRowProps['headers'] = xData.map((x: MatrixDatum) => ({
        id: x.id,
        title: x.title,
        link: generateLink(config, x),
      }));

      const xyzMap: any = {};
      xyzData.forEach((xyz: MatrixXYZDatum) => {
        if (!xyzMap[xyz.xid]) {
          xyzMap[xyz.xid] = {};
        }
        const zSet = new Set(xyz.zid);
        xyzMap[xyz.xid][xyz.yid] = Array.from(zSet).sort();
      });

      // Parse ZData
      zData.forEach((z: MatrixDatum, i: number) => {
        const currentColor = generateColor(zData.length, i);
        colorMap[z.title] = currentColor;

        legendCells.push({ id: currentColor, colors: [currentColor] });
        legendHeaders.push({
          id: z.id,
          className: 'legend-text-container',
          title: z.title,
          link: generateLink(config, null, null, z),
        });
      });

      // Parse Matrix Rows
      yData.forEach((y: MatrixDatum) => {
        const matrixCells: Array<CellProps> = [];

        // Parse Cells
        xData.forEach((x: MatrixDatum) => {
          let cellLink = '';
          const cellColors: Array<string> = [];
          if (xyzMap[x.id] && xyzMap[x.id][y.id]) {
            const currZ = xyzMap[x.id][y.id];
            cellLink = generateLink(config, x, y);

            // Parse Cell Colors
            currZ.forEach((zTitle: string) => {
              cellColors.push(colorMap[zTitle]);
            });
          }

          matrixCells.push({
            id: x.id + ' + ' + y.id,
            title: x.title + ' + ' + y.title,
            link: cellLink,
            colors: cellColors,
          });
        });

        matrixRows.push({
          id: y.id,
          title: y.title,
          link: generateLink(config, null, y),
          cells: matrixCells,
        });
      });

      const parsedData: MatrixProps['matrixData'] = {
        rows: matrixRows,
        headers: matrixHeaders,
        legend: { cells: legendCells, header: { headers: legendHeaders } },
      };

      const matrixProps: MatrixProps = { matrixData: parsedData };
      setMatrixProps(matrixProps);

      return parsedData;
    };

    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(windowRef.matrixConfigs);

      $log.log('config file:');
      $log.log(config);

      fetchMatrixData(config);
      setMatrixProps(matrixProps);
    } catch (error: any) {
      dispatchError({ error });
    }
  }, []);

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

  // if there was an error during setup, hide the spinner
  if (!matrixProps && errors.length > 0) {
    return <></>;
  }

  if (!matrixProps) {
    return <ChaiseSpinner />;
  }

  return <Matrix {...matrixProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
