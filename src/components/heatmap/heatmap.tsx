// hooks
import { useEffect, useRef, useState } from 'react';

// utilties
import { chaiseURItoErmrestURI, createRedirectLinkFromPath, getQueryParams, getCatalogId } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { generateUUID }  from '@isrd-isi-edu/chaise/src/utils/math-utils';


// services
import $log from '@isrd-isi-edu/chaise/src/services/logger';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import ChaiseToolTip from '@isrd-isi-edu/chaise/src/components/tooltip';
import {windowRef} from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import HeatmapPlot from './heatmap-plot';


export type HeatmapProps = {
  config: any,
};

const Heatmap = ({
  config,
}: HeatmapProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);
  const [invalidConfigs, setInvalidConfigs] = useState<any>([]);
  const [configErrorsPresent, setConfigErrorsPresent] = useState<boolean>(false);
  const [heatmaps, setHeatmaps] = useState<any>([]);
  const [NCBIGeneID, setNCBIGeneID] = useState<String>();
  const [header, setHeader] = useState<any>({});
  const [facet, setFacet] = useState<any>({});



  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;
    const ermrestURI = chaiseURItoErmrestURI(windowRef.location);
		setHeader({
      wid: window.name,
      cid: "heatmap",
      pid: generateUUID(),
			action: "model/read",
			schema_table: "Gene_Expression:Array_Data_view",
			catalog: getCatalogId()
		});
		setFacet({
			"and": [{
				"markdown_name": "Gene NCBI ID",
				"entity": false,
				"choices": [NCBIGeneID],
				"source": "NCBI_GeneID",
				"hide_not_null_choice": true,
            	"hide_null_choice": true
			}]
		});

    ConfigService.ERMrest.resolve(ermrestURI.ermrestUri,header).then((response: any) => {
      const reference = response.contextualize.compact;
      verifyConfiguration(reference);
      if (!configErrorsPresent) {
        var sortBy = typeof config.data.sortBy !== "undefined" ? config.data.sortBy : [];
        var ref = reference.sort(sortBy);
        header['action']="main";
        var pcid=getQueryParams(location.href).pcid
        var ppid=getQueryParams(location.href).ppid
        if(pcid)
          Object(header)["pcid"]=pcid;
        if(ppid)
          Object(header)["ppid"]=ppid;
        ref.read(1000, header).then(function getPage(page:any) {
          readAll(page);
        }).catch(function (error: any) {
          setInvalidConfigs(["Error while reading data from Ermrestjs"]);
          setConfigErrorsPresent(true);
        });
      }
    });

  }, []);

  useEffect(()=>{
    setFacet({
			"and": [{
				"markdown_name": "Gene NCBI ID",
				"entity": false,
				"choices": [NCBIGeneID],
				"source": "NCBI_GeneID",
				"hide_not_null_choice": true,
            	"hide_null_choice": true
			}]
		});
  },[NCBIGeneID]);

  const verifyConfiguration = (reference: any) => {
    var columns = ["titleColumn", "idColumn", "xColumn", "yColumn", "zColumn"];
    setInvalidConfigs([]);
    for (var i = 0; i < columns.length; i++) {
      try {
        reference.getColumnByName(config.data[columns[i]]);
      } catch (error) {
        invalidConfigs.push("Coulmn \"" + config.data[columns[i]] + "\" does not exist. Give a valid value for the " + columns[i] + ".")
      }
    }
    var sortColumns = config.data.sortBy;
    for (var i = 0; i < sortColumns.length; i++) {
      try {
        reference.getColumnByName(sortColumns[i].column);
      } catch (error) {
        invalidConfigs.push("Coulmn \"" + sortColumns[i].column + "\" in \"sortBy\" field does not exist. Replace it with a valid column.")
      }
    }
    if (invalidConfigs.length > 0) {
      setInvalidConfigs(invalidConfigs);
      setConfigErrorsPresent(true);
    }
  }
  const readAll = (page:any) => {
    for (var i = 0; i < page.tuples.length; i++) {
      addData(page.tuples[i]);
    }
    if (page.hasNext) {
      Object(header).action = "page";
      page.next.read(1000, header).then(readAll).catch(function (error:any) {
        setInvalidConfigs(["Error while reading data from Ermrestjs"]);
        setConfigErrorsPresent(true);
      });
    } else {
      console.log("heatmaps: ", heatmaps);
      setHeatmaps(heatmaps);
    }
    setNCBIGeneID(page.tuples[0].data.NCBI_GeneID);
  }

  const addData = (tuple:any) => {
    var configData = Object.assign({}, config.data);
    var hm = null;
    var x = tuple.data[configData.xColumn];
    var y = tuple.data[configData.yColumn];
    var z = tuple.data[configData.zColumn];
    var title = tuple.data[configData.titleColumn];
    var id = tuple.data[configData.idColumn];
    for (var i = 0; i < heatmaps.length; i++) {
      if (heatmaps[i].title == title) {
        heatmaps[i].id = id;
        hm = heatmaps[i];
      }
    }
    if (hm == null) {
      hm = { 'title': title, 'rows': { y: [], x: [], z: [], type: 'heatmap' } };
      heatmaps.push(hm);
    }
    var rowIndex = hm.rows.y.indexOf(y);
    if (rowIndex < 0) {
      hm.rows.y.push(y);
      hm.rows.z.push([]);
      rowIndex = hm.rows.y.indexOf(y);
    }
    if(!hm.rows.x.includes(x)){
      hm.rows.x.push(x);
    }
    hm.rows.z[rowIndex].push(z);
  }

//  Calculates the height and margins of the heatmap based on the number of y values and length of the longest X label so that the labels 
//  do not get clipped and the bar height is adjusted accordingly.
  const getHeatmapLayoutParams = (input: any, longestXTick: number, longestYTick: number, lengthY: number)=> {
		var height;
		var yTickAngle;
		var tMargin = 25, rMargin, bMargin, lMargin;

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

		if (lengthY == 1) {
			yTickAngle = -90;
			lMargin = 30;
			rMargin = 20;
		} else {
			yTickAngle = 0;
			lMargin = 20 + longestYTick * 7;
			rMargin = 5;
		}

		var layoutParams = {
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

  //Function to create plot(data) and layout object used by PlotlyChart component to produce heatmaps
  const createPlotLayoutParams = (plot:any) => {
    var configPresentation = Object.assign({}, config.presentation);
    var layout={};
    if (plot) {
          var longestXTick = plot.rows.x.reduce((a:any,b:any) => { return a.length > b.length ? a : b; });
          var longestYTick = plot.rows.y.reduce((a:any,b:any) => { return a.length > b.length ? a : b; });
          var inputParams = {
            width: typeof configPresentation.width !== "undefined" ? configPresentation.width : 1200,
            xTickAngle: typeof configPresentation.xTickAngle !== "undefined" ? configPresentation.xTickAngle : 50,
            tickFont: {
              family: typeof configPresentation.tickFontFamily !== "undefined" ? configPresentation.tickFontFamily : 'Courier',
              size: typeof configPresentation.tickFontSize !== "undefined" ? configPresentation.tickFontSize : 12
            }
          };
          var layoutParams = getHeatmapLayoutParams(inputParams, longestXTick.length, longestYTick.length, plot.rows.y.length);
          
          layout = {
            title: plot.title,
            xaxis: {
              tickangle: layoutParams.xTickAngle,
              tickfont: layoutParams.tickFont,
              tickvals: plot.rows.x,
              ticktext: plot.rows.x,
            },
            yaxis: {
              tickangle: layoutParams.yTickAngle,
              tickvals: plot.rows.y,
              ticktext: plot.rows.y,
              tickfont: layoutParams.tickFont
            },
            margin: layoutParams.margin,
            height: layoutParams.height,
            width: layoutParams.width
          };
          plot.rows.colorbar = {
            lenmode: "pixels",
            len: layoutParams.height - 40 < 100 ? layoutParams.height - 40 : 100
          }
      }
      return {plot,layout};
  }


  return (
    <div style={{ marginTop:'1%', overflow: 'auto', maxHeight: '90vh' }}>	
        <ChaiseToolTip
          placement='right'
          tooltip="View Array Data related to this Gene"
          >
          <a style={{marginLeft:'1%'}} href={`${window.origin}/chaise/recordset/${ConfigService.ERMrest.createPath("2", "Gene_Expression", "Array_Data", facet)}?pcid=${header.cid}&ppid=${header.pid}`} target='_blank'>View Array Data Table</a>
        </ChaiseToolTip>
      {/* Iterating over the heatmaps fetched for the given NCBIGeneID */}
        {heatmaps.map((heatmap:any): JSX.Element => {
        const {plot,layout} = createPlotLayoutParams(heatmap);
        return <div id={`heatmap_${heatmap.id}`} key={`heatmap_${heatmap.id}`}><HeatmapPlot key={`heatmap_${heatmap.id}`} data={plot} layout={layout} /></div>;
      })}
    </div>
  )
}

export default Heatmap;