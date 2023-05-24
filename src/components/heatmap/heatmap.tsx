// hooks
import { useEffect, useRef, useState } from 'react';

// utilties
import { chaiseURItoErmrestURI, getQueryParams, getCatalogId } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { generateUUID } from '@isrd-isi-edu/chaise/src/utils/math-utils';


// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import ChaiseToolTip from '@isrd-isi-edu/chaise/src/components/tooltip';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import HeatmapPlot from '@isrd-isi-edu/deriva-webapps/src/components/heatmap/heatmap-plot';


export type HeatmapProps = {
  config: any,
};

const Heatmap = ({
  config,
}: HeatmapProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);
  const [invalidConfigs, setInvalidConfigs] = useState(['']);
  const [configErrorsPresent, setConfigErrorsPresent] = useState<boolean>(false);
  const [heatmaps, setHeatmaps] = useState<any>([]);
  const [NCBIGeneID, setNCBIGeneID] = useState('');
  const [header, setHeader] = useState({});
  const [facet, setFacet] = useState({});



  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;
    const ermrestURI = chaiseURItoErmrestURI(windowRef.location);
    setHeader({
      wid: window.name,
      cid: 'heatmap',
      pid: generateUUID(),
      action: 'model/read',
      schema_table: 'Gene_Expression:Array_Data_view',
      catalog: getCatalogId()
    });
    setFacet({
      'and': [{
        'markdown_name': 'Gene NCBI ID',
        'entity': false,
        'choices': [NCBIGeneID],
        'source': 'NCBI_GeneID',
        'hide_not_null_choice': true,
        'hide_null_choice': true
      }]
    });

    ConfigService.ERMrest.resolve(ermrestURI.ermrestUri, header).then((response: any) => {
      const reference = response.contextualize.compact;
      verifyConfiguration(reference);
      if (!configErrorsPresent) {
        const sortBy = typeof config.data.sortBy !== 'undefined' ? config.data.sortBy : [];
        const ref = reference.sort(sortBy);
        setHeader((prevHeader) => ({ ...prevHeader, action: 'main' }));
        const pcid = getQueryParams(location.href).pcid
        const ppid = getQueryParams(location.href).ppid
        if (pcid)
          setHeader((prevHeader) => ({
            ...prevHeader,
            pcid,
          }));
        if (ppid)
          setHeader((prevHeader) => ({
            ...prevHeader,
            ppid,
          }))
        ref.read(1000, header).then(function getPage(page: any) {
          readAll(page);
        }).catch(function () {
          setInvalidConfigs(['Error while reading data from Ermrestjs']);
          setConfigErrorsPresent(true);
        });
      }
    });

  }, []);

  useEffect(() => {
    setFacet({
      'and': [{
        'markdown_name': 'Gene NCBI ID',
        'entity': false,
        'choices': [NCBIGeneID],
        'source': 'NCBI_GeneID',
        'hide_not_null_choice': true,
        'hide_null_choice': true
      }]
    });
  }, [NCBIGeneID]);


  const verifyConfiguration = (reference: any) => {
    const columns = ['titleColumn', 'idColumn', 'xColumn', 'yColumn', 'zColumn'];
    setInvalidConfigs(() => []);
    for (let i = 0; i < columns.length; i++) {
      try {
        reference.getColumnByName(config.data[columns[i]]);
      } catch (error) {
        setInvalidConfigs((prevInvalidConfigs) =>
          ([...prevInvalidConfigs, 'Coulmn \'' + config.data[columns[i]] + '\' does not exist. Give a valid value for the ' + columns[i] + '.']))
      }
    }
    const sortColumns = config.data.sortBy;
    for (let i = 0; i < sortColumns.length; i++) {
      try {
        reference.getColumnByName(sortColumns[i].column);
      } catch (error) {
        setInvalidConfigs((prevInvalidConfigs) =>
          ([...prevInvalidConfigs, 'Coulmn \'' + sortColumns[i].column + '\' in \'sortBy\' field does not exist. Replace it with a valid column.']));
      }
    }
    if (invalidConfigs.length > 0) {
      setInvalidConfigs(() => invalidConfigs);
      setConfigErrorsPresent(true);
    }
  }

  /**
   * @param page : Page object fecthed from response of ermrestURI
   */
  const readAll = (page: any) => {
    for (let i = 0; i < page.tuples.length; i++) {
      addData(page.tuples[i]);
    }
    if (page.hasNext) {
      Object(header).action = 'page';
      page.next.read(1000, header).then(readAll).catch(function () {
        setInvalidConfigs(() => ['Error while reading data from Ermrestjs']);
        setConfigErrorsPresent(() => false);
      });
    } else {
      setHeatmaps(() => (heatmaps));
    }
    setNCBIGeneID(() => (page.tuples[0].data.NCBI_GeneID));
  }
  /**
   * 
   * @param tuple : Tuple object retrieved from page
   * Adds data(x,y,z values) to heatmap objects
   */

  const addData = (tuple: any) => {
    const configData = Object.assign({}, config.data);
    let hm = null;
    const x = tuple.data[configData.xColumn];
    const y = tuple.data[configData.yColumn];
    const z = tuple.data[configData.zColumn];
    const title = tuple.data[configData.titleColumn];
    const id = tuple.data[configData.idColumn];
    for (let i = 0; i < heatmaps.length; i++) {
      if (Object(heatmaps[i]).title === title) {
        Object(heatmaps)[i]['id'] = id;
        hm = heatmaps[i];
      }
    }
    if (hm === null) {
      hm = { 'title': title, 'rows': { y: [], x: [], z: [], type: 'heatmap' } };
      heatmaps.push(hm);
    }
    let rowIndex = Object(hm).rows.y.indexOf(y);
    if (rowIndex < 0) {
      Object(hm).rows.y.push(y);
      Object(hm).rows.z.push([]);
      rowIndex = Object(hm).rows.y.indexOf(y);
    }
    if (!Object(hm).rows.x.includes(x)) {
      Object(hm).rows.x.push(x);
    }
    Object(hm).rows.z[rowIndex].push(z);
  }

  /**
     * @param {object} input : Input parameters of heatmap directive
     * @param {number} longestXTick : Length of longest X axis label
     * @param {number} longestYTick : Length of longest Y axis label
     * @param {number} lengthY : Number of Y values
     * Calculates the height and margins of the heatmap based on the number of y values and length of the longest X label
     * so that the labels do not get clipped and the bar height is adjusted accordingly.
     * Return an object with all the required layout parameters.
     * @example
     * {
     * 	height: height of the heatmap,
     * 	width: width of the heatmap,
     * 	margin: {
     * 		t: top margin of the heatmap,
     * 		r: right margin of the heatmap,
     * 		b: bottom margin of the heatmap,
     * 		l: left of the heatmap
     * 	},
     * 	xTickAngle: inclination of x axis labels,
     *  yTickAngle: inclination of y axis labels,
     * 	tickFont: font to be used in labels
     * }
     */
  const getHeatmapLayoutParams = (input: any, longestXTick: number, longestYTick: number, lengthY: number) => {
    let height;
    let yTickAngle;
    const tMargin = 25;
    let rMargin, bMargin, lMargin;

    if (longestXTick <= 18) {
      height = longestXTick * 9 + lengthY * 10 + 50;
      bMargin = 8.4 * longestXTick;
    } else if (longestXTick <= 22) {
      height = longestXTick * 9 + lengthY * 10 + 55;
      bMargin = 8.4 * longestXTick;
    } else if (longestXTick <= 30) {
      height = longestXTick * 8.8 + lengthY * 10 + 55;
      bMargin = 8.2 * longestXTick;
    } else {
      height = longestXTick * 8.8 + lengthY * 10 + 45;
      bMargin = 8 * longestXTick;
    }

    if (lengthY === 1) {
      yTickAngle = -90;
      lMargin = 30;
      rMargin = 20;
    } else {
      yTickAngle = 0;
      lMargin = 20 + longestYTick * 7;
      rMargin = 5;
    }

    const layoutParams = {
      height: height,
      width: input.width,
      margin: {
        t: tMargin,
        r: rMargin,
        b: bMargin,
        l: lMargin,
      },
      xTickAngle: input.xTickAngle,
      yTickAngle: yTickAngle,
      tickFont: input.tickFont
    };
    return layoutParams;
  }


  /** It can have following input parameters in the heatmap-config.js file in presenattion object:
   * @param {any} plot: heatmap object
   * Return data and layout object that can be passed to plotly component to generate heatmap
   * @example:
   * Plot
   * id: id of heatmap
   * rows{  
   * colorbar
   * type: type of plot (heatmap)
   * x: data to be shown on X axis
   * y: data to be shown on y axis
   * z: z values (affect the color of datapoint)
   * title: title of heatmap
   * }
   * ----------
   * Layout: 
   * height
   * margin: {t, r, b, }
   * title
   * width
   * xaxis: {tickangle, tickfont, tickvals, ticktext}
   * yaxis: {tickangle, tickvals, ticktext, tickfont} 
   */

  const createPlotLayoutParams = (plot: any = {}) => {
    const configPresentation = Object.assign({}, config.presentation);
    let layout = {};
    if (plot) {
      const longestXTick = plot?.rows?.x.reduce((a: any, b: any) => { return a?.length > b?.length ? a : b; });
      const longestYTick = plot?.rows?.y.reduce((a: any, b: any) => { return a?.length > b?.length ? a : b; });
      const inputParams = {
        width: typeof configPresentation.width !== 'undefined' ? configPresentation.width : 1200,
        xTickAngle: typeof configPresentation.xTickAngle !== 'undefined' ? configPresentation.xTickAngle : 50,
        tickFont: {
          family: typeof configPresentation.tickFontFamily !== 'undefined' ? configPresentation.tickFontFamily : 'Courier',
          size: typeof configPresentation.tickFontSize !== 'undefined' ? configPresentation.tickFontSize : 12
        }
      };
      const layoutParams = getHeatmapLayoutParams(inputParams, longestXTick?.length, longestYTick?.length, plot.rows?.y?.length);

      layout = {
        title: plot.title,
        xaxis: {
          tickangle: layoutParams.xTickAngle,
          tickfont: layoutParams.tickFont,
          tickvals: plot.rows?.x,
          ticktext: plot.rows?.x,
        },
        yaxis: {
          tickangle: layoutParams.yTickAngle,
          tickvals: plot.rows?.y,
          ticktext: plot.rows?.y,
          tickfont: layoutParams.tickFont
        },
        margin: layoutParams.margin,
        height: layoutParams.height,
        width: layoutParams.width
      };
      if (plot.rows) {
        plot['rows']['colorbar'] = {
          lenmode: 'pixels',
          len: layoutParams.height - 40 < 100 ? layoutParams.height - 40 : 100
        }
      }
    }
    return { plot, layout };
  }


  return (
    <div style={{ marginTop: '1%', overflow: 'auto', maxHeight: '90vh' }}>
      <ChaiseToolTip
        placement='right'
        tooltip='View Array Data related to this Gene'
      >
        <a style={{ marginLeft: '1%' }}
          href={`${window.origin}/chaise/recordset/${ConfigService.ERMrest.createPath('2', 'Gene_Expression', 'Array_Data', facet)}
          ?pcid=${Object(header).cid}&ppid=${Object(header).pid}`} target='_blank' rel='noreferrer'>
          View Array Data Table</a>
      </ChaiseToolTip>
      {/* Iterating over the heatmaps fetched for the given NCBIGeneID */}
      {heatmaps.map((heatmap: any): JSX.Element => {
        const { plot, layout } = createPlotLayoutParams(heatmap);
        return <div id={`heatmap_${heatmap.id}`} key={`heatmap_${heatmap.id}`}>
          <HeatmapPlot key={`heatmap_${heatmap.id}`} data={plot} layout={layout} />
        </div>;
      })}
    </div>
  )
}

export default Heatmap;