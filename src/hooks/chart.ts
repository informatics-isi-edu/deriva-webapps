import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
} from 'plotly.js';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import {
  formatPlotData,
  createLink,
  getPatternUri,
  createLinkWithContextParams,
  extractLink,
  extractValue,
  extractAndFormatDate,
} from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { flatten2DArray } from '@isrd-isi-edu/deriva-webapps/src/utils/data';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import {
  createStudyViolinSelectGrid,
  useChartSelectGrid,
} from '@isrd-isi-edu/deriva-webapps/src/hooks/chart-select-grid';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import {
  Plot,
  PlotConfig,
  PlotConfigAxis,
  DataConfig,
  Trace,
  TraceConfig,
} from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';
import useIsFirstRender from '@isrd-isi-edu/chaise/src/hooks/is-first-render';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

/**
 * Data received from API request
 */
export type Response = {
  /**
   * Dta received from response
   */
  data: ResponseData;
  /**
   * Status code for response
   */
  status: number;
};

/**
 * Uunpacked within the response
 */
export type ResponseData = Array<any>;

/**
 * Data packed in result
 */
export type PlotResultData = {
  /**
   * Data for the x axis
   */
  x: string[] & number[];
  /**
   * Data for the y axis
   */
  y: string[] & number[];
  /**
   * text hover for the plot
   */
  text?: any[] | string[];
};

export type HeatmapZData = {
  /**
 * Data for the z axis
 */
  z: any[];
}

export type ClickableLinks = {
  /**
   * Links for the plot graphic
   */
  graphic_clickable_links: string[];
  /**
   * Links for the legend
   */
  legend_clickable_links: string[];
};

/**
 * Data packed in result
 */
export type PieResultData = {
  /**
   * Hover text for the plot
   */
  text: string[] & number[];
  /**
   * Legend labels for the plot
   */
  labels: string[] & number[];
};

export type PlotTemplateParams = {
  /**
   * Parameters for URL
   */
  $url_parameters: {
    [paramKey: string]: any;
  };
  /**
   * No data flag
   */
  noData: boolean;
};

export type inputParamsType = {
  /**
   * Width of heatmap plot
   */
  width: number,
  /**
   * x axis tick text angle
  */
  xTickAngle: number | 'auto',
}

export type layoutParamsType = {
  /**
  * Height of heatmap plot
  */
  height: number,
  /**
  * Width of heatmap plot
  */
  width: number,
  /**
  * Margin values of heatmap plot
  */
  margin: {
    t: number,
    r: number,
    b: number,
    l: number,
  },
  /**
   * x axis tick text angle
  */
  xTickAngle: number | 'auto',
  /**
   * y axis tick text angle
  */
  yTickAngle: number,
}


/**
 * Sets the plot configs
 *
 * @param plotConfigs
 */
export const usePlotConfig = (plotConfigs: PlotConfig) => {
  const { dispatchError, errors } = useError();

  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<DataConfig | null>(null);

  useEffect(() => {
    try {
      const config = getConfigObject(plotConfigs);
      setTypeConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [plotConfigs, dispatchError]);

  return { errors, config: typeConfig };
};

/**
 * Hook function to handle the needed data to be used by the chart
 *
 * @param plot configuration object
 * @returns all data to be used by plot
 */
export const useChartData = (plot: Plot) => {
  const isFirstRender = useIsFirstRender();
  const [data, setData] = useState<any | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInitLoading, setIsInitLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isParseLoading, setIsParseLoading] = useState<boolean>(false);
  const { dispatchError, errors } = useError();

  /**
   * Template parameters for the plot
   * TODO: eventually remove this, everything in here is already stored in state
   *    - or could be a provider created for each plot
   * TODO: create functions to retrieve only the neccesary templateParams from state and pass them into a more local scope
   *    - gene and study selectors touch these params to modify values used in API requests
   */
  const templateParams: PlotTemplateParams = useMemo(
    () => ({
      $url_parameters: {
        Gene: {
          data: {
            NCBI_GeneID: getQueryParam(windowRef.location.href, 'NCBI_GeneID') || 1, // TODO: deal with default value
          },
        },
        Study: [],
      },
      noData: false, // TODO: remove hack when empty selectedRows are fixed
    }),
    []
  );

  const {
    selectData,
    handleCloseModal,
    handleSubmitModal,
    fetchSelectData,
    setSelectData,
    isFetchSelected,
    setIsFetchSelected,
  } = useChartSelectGrid({
    templateParams,
    setModalProps,
    setIsModalOpen,
  });

  /**
   * Fetches data from the plot traces in the plot config and returns the data
   */
  const fetchData = useCallback(async () => {
    // console.log('fetchData occurred');
    // Fulfill promise for plot
    // NOTE: If 1 trace request fails, all requests fail. Should this be addressed?
    const plotResponses: Array<Response> = await Promise.all(
      // request for each trace
      plot.traces.map((trace) => {
        // Check for queryPattern(dynamic link) parameter in traces, if not defined then check for uri(static link)
        if (trace.queryPattern) {
          const { uri, headers } = getPatternUri(trace.queryPattern, templateParams);
          return ConfigService.http.get(uri, { headers });
        }
        else if (trace.uri) {
          return ConfigService.http.get(trace.uri);
        }  else {
          return { data: [] };
        }
      })
    );

    return plotResponses.map((response: Response) => response.data); // unpack data
  }, [plot, templateParams]);

  // Effect to fetch initial data
  useEffect(() => {
    const fetchInitData = async () => {
      console.log('fetch initial occurred');
      setIsInitLoading(true);
      if (getQueryParam(window.location.href, 'config') === 'study-violin') {
        const selectGrid = createStudyViolinSelectGrid(plot); // TODO: change plot.plot_type to study-violin
        const initialSelectData = await fetchSelectData(selectGrid); // fetch the data needed for the select grid
        setSelectData(initialSelectData); // set the data for the select grid
      }
      const plotData = await fetchData(); // fetch the data for the plot
      setData(plotData); // set the data for the plot
      setIsInitLoading(false); // set loading to false
    };

    if (isFirstRender) {
      // only run on first render
      try {
        fetchInitData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [
    plot,
    isFirstRender,
    fetchSelectData,
    setSelectData,
    templateParams,
    fetchData,
    dispatchError,
  ]);

  // Effect to fetch data on subsequent changes when different selections are made (when selectData changes)
  useEffect(() => {
    const fetchSubsequentData = async () => {
      console.log('fetch occurred');
      setIsDataLoading(true);
      setIsParseLoading(true);
      const plotData = await fetchData();
      setData(plotData);
      setIsDataLoading(false);
      setIsFetchSelected(false);
    };

    if (!isFirstRender && isFetchSelected) {
      // only run on subsequent renders and when selectData changes with isFetchSelected being true
      // we only want to fetch data when the selection made requires it
      // cause some selection changes can simply be handled by reparsing the existing data
      try {
        fetchSubsequentData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [
    isFirstRender,
    isFetchSelected,
    setIsFetchSelected, 
    selectData,
    templateParams,
    fetchData,
    dispatchError,
  ]);

  // Parse data on state changes to data or selectData
  useEffect(() => {
    if (data && !isDataLoading && !isInitLoading && !isFetchSelected) {
      const parsedPlotData = parsePlotData(plot, data, selectData, templateParams);
      setParsedData(parsedPlotData);
      setIsParseLoading(false); // set loading to false after parsing
    }
  }, [plot, data, isDataLoading, isFetchSelected, isInitLoading, selectData, templateParams]);
  return {
    isInitLoading,
    isDataLoading,
    isParseLoading,
    isFetchSelected,
    modalProps,
    isModalOpen,
    selectData,
    parsedData,
    data,
    errors,
    handleCloseModal,
    handleSubmitModal,
  };
};

/**
 * Parses data for the unpackedResponses for every plot based on its type
 *
 * @param plot configs for a specific plot
 * @param unpackedResponses response data
 * @returns plotly data to be inserted into props
 */
const parsePlotData = (
  plot: Plot,
  unpackedResponses: ResponseData[],
  selectDataGrid: any,
  templateParams: any
) => {
  const result: any = { data: [] };
  result.config = { ...plot?.plotly?.config };
  let hovertemplate_display_pattern;
  result.layout = {
    ...plot.plotly?.layout,
    width: undefined, // undefined to allow for responsive layout
    height: undefined, // undefined to allow for responsive layout
  };
  // NOTE: width and height max are set in dynamic styles of chart-with-effect.tsx

  // Add all plot "traces" to data array based on plot type
  let additionalLayout = {};
  result.data = unpackedResponses.map((responseData: ResponseData, index: number) => {
    const currTrace = plot.traces[index];
    hovertemplate_display_pattern = currTrace.hovertemplate_display_pattern; //use trace info
    if (plot.plot_type === 'bar') {
      return parseBarResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'pie') {
      return parsePieResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'scatter') {
      return parseScatterResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'histogram') {
      return parseHistogramResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'violin') {
      const { result: parseResult, layout } = parseViolinResponse(
        currTrace,
        plot,
        responseData,
        selectDataGrid,
        templateParams.noData
      );
      additionalLayout = layout;
      return parseResult;
    } else if (plot.plot_type === 'heatmap') {
      const heatmapData = parseHeatmapResponse(currTrace, plot, responseData, templateParams);
      additionalLayout = { ...heatmapData.layoutParams };
      return heatmapData.result;
    }
  });

  updatePlotlyConfig(plot, result); // update the config
  updatePlotlyLayout(plot, result, templateParams, additionalLayout, selectDataGrid); // update the layout
  //If hovertemplate_display_pattern is not configured, set default hover text for plot
  if(!hovertemplate_display_pattern){
    defaultHoverTemplateDisplay(result); // default hover template
  }
  // width and heigh are set in the css
  console.log(result);
  return result;
};

/**
 * Updates the plotly config based on the given plot configs
 *
 * @param plot configs for a specific plot
 * @param result result to be updated
 */
const updatePlotlyConfig = (plot: Plot, result: any): void => {
  result.config.displaylogo = Boolean(plot.config.displaylogo);
  // result.config.responsive = Boolean(plot.config.responsive);
  result.config.responsive = true;

  // legend
  if (plot.config.disable_default_legend_click) {
    // disable default legend click if it exists
    result.layout.disable_default_legend_click = plot.config.disable_default_legend_click;
  }
};

/**
 * Gets the axis title for groupby selector
 *
 * @param selectDataGrid
 * @param axis
 * @returns
 */
const getSelectGroupByAxisTitle = (selectDataGrid: any, axis: 'x' | 'y') => {
  let title = '';
  selectDataGrid.forEach((row: any) => {
    row.forEach((cell: any) => {
      if (cell.action === 'groupby' && cell.axis === axis) {
        const { groupKeysMap, value } = cell;
        const group = groupKeysMap[value.value];
        if (group.title_display_pattern) {
          title = createLink(group.title_display_pattern);
        }
      }
    });
  });
  return title;
};

/**
 * Gets the axis title for scale selector
 *
 * @param selectDataGrid
 * @param title_display_markdown_pattern
 * @param axis
 * @returns
 */
const getSelectScaleAxisTitle = (
  selectDataGrid: any,
  title_display_markdown_pattern: string,
  axis: 'x' | 'y'
) => {
  let title = '';
  let type = '';
  selectDataGrid.forEach((row: any) => {
    row.forEach((cell: any) => {
      if (cell.action === 'scale' && cell.axis === axis) {
        if (cell.value.value === 'log') {
          title = createLink(`log(${title_display_markdown_pattern} + 1)`);
        } else {
          title = createLink(`${title_display_markdown_pattern}`);
        }
        type = cell.value.value;
      }
    });
  });
  return { title, type };
};

/**
 * Updates the plotly layout based on given plot configs
 *
 * @param plot configs for a specific plot
 * @param result result to be updated
 */
const updatePlotlyLayout = (
  plot: Plot,
  result: any,
  templateParams: any,
  additionalLayout?: any,
  selectDataGrid?: any
): void => {
  // title
  let title = '';

  if (plot.config.title_display_markdown_pattern) {
    // use the title_display_markdown_pattern if it exists
    title = createLink(plot.config.title_display_markdown_pattern, templateParams);
  }
  if (templateParams.noData) {
    // TODO: remove this hack
    title = 'No Data';
  }
  if (title) result.layout.title = title;

  // x axis
  if (!result.layout.xaxis) {
    // initialize xaxis if it doesn't exist
    result.layout.xaxis = {};
  }
  if (plot.config.xaxis?.title_display_markdown_pattern) {
    // use the title_display_markdown_pattern if it exists
    result.layout.xaxis.title = createLink(plot.config.xaxis.title_display_markdown_pattern);
  }
  if (additionalLayout?.xaxis?.tickvals) {
    // use the tickvals if it exists
    result.layout.xaxis.tickvals = additionalLayout.xaxis.tickvals;
  }
  // if (additionalLayout?.xaxis?.ticktext) {
  //   // use the ticktext if it exists
  //   result.layout.xaxis.ticktext = additionalLayout.xaxis.ticktext;
  // }
  if (selectDataGrid) {
    // use the groupby axis title if it exists
    const xaxisTitle = getSelectGroupByAxisTitle(selectDataGrid, 'x');
    if (xaxisTitle) {
      result.layout.xaxis.title = xaxisTitle;
    }
  }

  result.layout.xaxis.automargin = true; // always set automargin to true
  result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : ''; // set tickformat based on the config
  result.layout.xaxis.ticksuffix = '  '; // add a space to the end of the tick for spacing

  // y axis
  if (!result.layout.yaxis) {
    result.layout.yaxis = {};
  }
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);

    if (Array.isArray(selectDataGrid)) {
      const yaxisTitle = getSelectScaleAxisTitle(
        selectDataGrid,
        plot.config.yaxis.title_display_markdown_pattern,
        'y'
      );
      if (yaxisTitle.title) {
        result.layout.yaxis.title = yaxisTitle.title;
        result.layout.yaxis.type = yaxisTitle.type;
      }
    }
  }

  if (plot.plot_type === 'violin') {
    result.layout.hovermode = 'closest';
    result.layout.dragmode = 'pan';
    if (result.layout.yaxis.zeroline === undefined) {
      result.layout.yaxis.zeroline = false;
    }
  }

  result.layout.yaxis.automargin = true;
  result.layout.yaxis.ticksuffix = '  ';

  // buttons
  if (plot?.plotly?.config?.modeBarButtonsToRemove) {
    result.layout.modebar = { remove: plot?.plotly?.config?.modeBarButtonsToRemove };
  }
  if (plot.plot_type === 'heatmap') {
    result.layout.margin = additionalLayout.margin;
    result.layout.height = additionalLayout.height;
    result.layout.width = additionalLayout.width;
    result.data[0]['colorbar'] = {
      lenmode: 'pixels',
      len: additionalLayout.height - 40 < 100 ? additionalLayout.height - 40 : 100
    }
  }
  result.layout.autoresize = true;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseViolinResponse = (
  trace: Trace,
  plot: Plot,
  responseData: ResponseData,
  selectDataGrid: any,
  noData?: boolean
) => {
  const { ...plotlyTrace } = trace;
  const result: Partial<TraceConfig> &
    Partial<PlotlyViolinData> &
    Partial<{ transforms: any[] }> &
    Partial<ClickableLinks> = {
    ...plotlyTrace,
    type: 'violin',
    x: [], // x data
    y: [], // y data

    // TODO: migrate all these params options to config
    points: 'all', // show all points on violin plot
    pointpos: 0, // position of points on violin plot
    box: {
      visible: true, // show box plot
    },
    meanline: {
      visible: true, // show mean line
    },
    line: {
      width: 1, // width of violin plot
    },

    legend_clickable_links: [], // array of links for clicking on legend
    graphic_clickable_links: [], // array of links for clicking on graph points
  };

  const layout: any = {};

  if (!noData) {
    const selectDataArray = flatten2DArray(selectDataGrid);
    let yScale: any = null;
    let xGroupBy: any = null;
    selectDataArray.forEach((selectObj) => {
      if (selectObj.action === 'groupby' && selectObj.axis === 'x') {
        xGroupBy = selectObj;
      }
      if (selectObj.action === 'scale' && selectObj.axis === 'y') {
        yScale = selectObj;
      }
    });

    const x: any[] = [];
    const y: any[] = [];
    const xTicks: any[] = [];
    let tempText:any[]=[];
    responseData.forEach((item: any, i: number) => {
      if (xGroupBy) {
        const groupByKey = xGroupBy.value.value;
        const xGroupItem = xGroupBy.groupKeysMap[groupByKey];
        updateWithTraceColData(result, trace, item, i, xGroupItem);

        const xVal = xGroupItem?.legend_markdown_pattern
          ? createLink(xGroupItem?.legend_markdown_pattern[0], { $row: item })
          : (item[groupByKey] || 'N/A');

        const xTick = xGroupItem?.tick_display_markdown_pattern
          ? createLink(xGroupItem?.tick_display_markdown_pattern, { $row: item })
          : 'N/A';

        x.push(xVal);
        xTicks.push(xTick);
      }

      if (yScale) {
        const yItem = item[yScale.setting.group_key];
        if (yScale.value.value === 'log') {
          // increase 'TPM' by 1 for log scale
          const yVal = yItem + 1;
          if (yVal !== null && yVal !== undefined) {
            y.push(yVal);
          }
        } else {
          const yVal = yItem ? createLink(yItem.toString()) : yItem;
          if (yVal !== null && yVal !== undefined) {
            y.push(yVal);
          }
        }
      }
      tempText=updateHoverTemplateData(result,trace,item,tempText);
    });

    result.x = x;
    result.y = y;
    //sets the hovertext array and hoverinfo
    setHoverText(result,tempText,trace);

    // group by x
    result.transforms = [
      {
        type: 'groupby',
        groups: result.x,
      },
    ];

    // add custom layout for x axis ticks
    layout.xaxis = {
      tickvals: result.x,
      ticktext: xTicks,
    };
  }

  return { result, layout };
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseHistogramResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> = {
    ...trace,
    type: 'histogram',
  };

  const { config } = plot;
  const { format_data = false } = config;
  let tempText:any[]=[];
  const dataPoints: Array<any> = [];
  responseData.forEach((item: any) => {
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      dataPoints.push(value);
    }
    tempText=updateHoverTemplateData(result,trace,item,tempText);
  });

  // Add data to correct axis depending on orientation
  if (trace.orientation === 'h') {
    result.y = dataPoints;
  } else if (trace.orientation === 'v') {
    result.x = dataPoints;
  }

  //sets the hovertext array and hoverinfo
  setHoverText(result,tempText,trace);
  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseScatterResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> = {
    ...trace,
    mode: 'markers',
    name: trace.legend ? trace.legend[0] : '',
    type: plot.plot_type,
    x: [], // x data
    y: [], // y data
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // TODO: move format_data_x to xaxis in config

  const x: string[] = [];
  const y: string[] = [];
  let tempText: any[] =[];
  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);

    // Add X data
    trace?.x_col?.forEach((colName: string) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      x.push(value?.toString());
    });

    // Add Y data
    trace?.y_col?.forEach((colName: string) => {
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      y.push(value?.toString());
    });
    tempText=updateHoverTemplateData(result,trace,item,tempText);
  });
  //sets the hovertext array and hoverinfo
  setHoverText(result,tempText,trace);
  result.x = x;
  result.y = y;
  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parsePieResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPieData> & PieResultData & ClickableLinks = {
    ...trace,
    type: plot.plot_type,
    hoverinfo: 'text+value+percent', // value to show on hover of a pie slice
    textinfo: plot.config.slice_label || 'value', // data shown on a pie slice
    labels: [], // array of labels for the legend
    text: [], // text to show on hover of a pie slice
    values: [], // the values for the legend
    legend_clickable_links: [], // array of links for when clicking legend
    graphic_clickable_links: [], // array of links for when clicking graph
  };

  const { config } = plot;
  const { format_data = false } = config;
  let tempText:any[]=[]; //use trace info
  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    // Add data
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      if (Array.isArray(result.values)) {
        result.values.push(value);
      }
    }

    // Add legend data if exists
    if (trace.legend_col) {
      const textValue = createLink(item[trace.legend_col], { $self: { data: item } });
      let labelValue = textValue;
      if (typeof trace.legend_markdown_pattern === 'string') {
        labelValue = createLink(trace.legend_markdown_pattern, { $self: { data: item } });
      }
      result.text.push(textValue);
      result.labels.push(labelValue);
    }
    tempText=updateHoverTemplateData(result,trace,item,tempText);
  });
  setHoverText(result,tempText,trace);
  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseBarResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData & ClickableLinks = {
    ...trace,
    type: plot.plot_type,
    textposition: 'outside', // position of bar values
    hoverinfo: 'text', // value to show on hover of a bar
    x: [], // x data
    y: [], // y data
    text: [], // text data
    legend_clickable_links: [], // array of links for when clicking legend
    graphic_clickable_links: [], // array of links for when clicking graph
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // why is format_data_x not in xaxis?
  let tempText:any[]=[];
  responseData.forEach((item: any) => {
    // Add the x values for the bar plot
    trace?.x_col?.forEach((colName: string, i: number) => {
      if (trace.orientation === 'h') {
        // update the trace data if orientation is horizontal
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text?.push(textValue.toString());
      }
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x.push(value.toString());
    });

    // Add the y values for the bar plot
    trace?.y_col?.forEach((colName: string, i: number) => {
      if (trace.orientation === 'v') {
        // update the trace data if orientation is vertical
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text?.push(textValue.toString());
      }
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y.push(value.toString());
    });
    tempText=updateHoverTemplateData(result,trace,item,tempText);
  });
  //sets the hovertext array and hoverinfo
  setHoverText(result,tempText,trace);
  return result;
};


/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @param templateParams url parameters
 * @returns
 */
const parseHeatmapResponse = (trace: Trace, plot: Plot, responseData: ResponseData, templateParams: PlotTemplateParams) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData & ClickableLinks & HeatmapZData = {
    ...trace,
    type: plot.plot_type,
    x: [], // x data
    y: [], // y data
    z: [], // z data
    text: [], // text data
    legend_clickable_links: [], // array of links for when clicking legend
    graphic_clickable_links: [], // array of links for when clicking graph
  };
  let yIndex = 0;
  let layoutParams = {};
  let longestXTick = '';
  let longestYTick = '';
  let tempText: any[] = [];

  const { config, plotly } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config;
  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    // Add the y values for the heatmap plot
    trace?.y_col?.forEach((colName: string) => {
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      // Adds the y value for the heatmap plot if it is not added yet in y array
      if (result.y.indexOf(value.toString()) < 0) {
        result.y.push(value.toString());
        if (item[colName].toString().length > longestYTick?.length) {
          longestYTick = item[colName].toString();
        }
        tempText.push([]);
        result.z.push([]);
      }
      // Fetching the index of added y value to add corresponding z value
      yIndex = result.y.indexOf(value.toString());
    });
    
    // Add the z values for the heatmap plot based on y val's index
    trace?.z_col?.forEach((colName: string) => {
      const zValue = item[colName];
      result?.z[yIndex]?.push(zValue);
      tempText=updateHoverTemplateData(result,trace,item,tempText,yIndex,templateParams);
    });
    // Add the x values for the heatmap plot if its not added yet
    trace?.x_col?.forEach((colName: string) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      if (result.x.indexOf(value.toString()) < 0) {
        if (item[colName].toString().length > longestXTick?.length) {
          longestXTick = item[colName].toString();
        }
        result.x.push(value.toString());
      }
    });


  });
  // Getting the longest x tick in the given data to determine margin and height values in getHeatmapLayoutParams function
  const inputParams = {
    width: typeof plotly?.layout.width !== 'undefined' ? plotly?.layout.width : 1200,
    xTickAngle: typeof plotly?.layout.xaxis?.tickangle !== 'undefined' ? plotly?.layout.xaxis?.tickangle : 50,
  }
  //sets the hovertext array and hoverinfo
  setHoverText(result,tempText,trace);

  layoutParams = getHeatmapLayoutParams(inputParams, longestXTick?.length, longestYTick?.length, result.y?.length);
  return { layoutParams, result };
};

/**
 * 
 * @param input : Input parameters of heatmap directive
 * @param longestXTick : Length of longest X axis label
 * @param longestYTick : Length of longest Y axis label
 * @param lengthY : Number of Y values
 * @returns 
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
const getHeatmapLayoutParams = (input: inputParamsType, longestXTick: number, longestYTick: number, lengthY: number) => {
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

  const layoutParams: layoutParamsType = {
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
  };
  return layoutParams;
}

/**
 * Gets the value in the form of a link from the given markdown pattern.
 * Optionally formats the value.
 *
 * @param item each item of data
 * @param colName column name for the item of data
 * @param axis axis object from plot config
 * @param formatData whether to format the data or not
 * @param plot plot config
 * @returns
 */
const getValue = (
  item: any,
  colName: string,
  axis: PlotConfigAxis | undefined,
  formatData: boolean,
  plot: Plot
): string | number => {
  let value = item[colName];
  if (axis && axis?.tick_display_markdown_pattern) {
    value = createLink(axis.tick_display_markdown_pattern, { $self: { data: item } });
  }
  return formatPlotData(value, formatData, plot.plot_type);
};

/**
 * Updates the trace with given the given trace passed in from plot-cnofig and the item data
 *
 * @param result trace object to be updated
 * @param trace from plot configs
 * @param item from the response object
 * @param index index of the response
 */
const updateWithTraceColData = (
  result: any,
  trace: Trace,
  item: any,
  index: number,
  extraInfo?: any
): void => {
  // legend name
  let name = trace.legend ? trace.legend[index] : '';
  if (trace.legend_markdown_pattern) {
    name = createLink(trace.legend_markdown_pattern[index] || '');
  }
  result.name = name;

  const legend_markdown_pattern =
    trace.legend_markdown_pattern || extraInfo?.legend_markdown_pattern; // use either the trace or extraInfo
  if (legend_markdown_pattern) {
    // if there is a legend_markdown_pattern then create the link and add it to the array
    const linkPattern = Array.isArray(legend_markdown_pattern)
      ? legend_markdown_pattern[index]
      : legend_markdown_pattern;
    const extractedLinkPattern = createLinkWithContextParams(linkPattern);
    if (extractedLinkPattern) {
      const link = createLink(extractedLinkPattern, { $self: { data: item } });
      if (link) {
        result.legend_clickable_links.push(link);
      }
    }
  }

  const graphic_link_pattern = trace.graphic_link_pattern || extraInfo?.graphic_link_pattern; // use either the trace or extraInfo
  if (graphic_link_pattern) {
    // if there is a graphic_link_pattern then create the link and it to the array
    const linkPattern = Array.isArray(graphic_link_pattern)
      ? graphic_link_pattern[0]
      : graphic_link_pattern;
    if (linkPattern) {
      const link = createLink(linkPattern, { $self: { data: item }, $row: item });
      if (link) {
        result.graphic_clickable_links.push(link);
      }
    }
  }

};

/**
 * 
 * @param result data object to be updated
 * @param trace from plot configs
 * @param item from response object
 * @param textArray array for hover text
 * @param index provided for heatmap case for corresponding y axis values
 * @param templateParams provided for heatmap to access url_parameters
 * @returns 
 */
const updateHoverTemplateData = (result: any,  trace: Trace, item: any, textArray: any[], index: number=0, templateParams?: PlotTemplateParams) => {
  const hovertemplate_display_pattern = trace.hovertemplate_display_pattern; // use trace info
  if(hovertemplate_display_pattern){
    const link = ConfigService.ERMrest._renderHandlebarsTemplate(hovertemplate_display_pattern, { $self: { data: item }, 
      $row: item, 
      $url_parameters: templateParams?.$url_parameters
    });
    if(link){
      switch(result.type){
        case 'bar':
        case 'scatter':
          textArray.push(link);
          break;
        case 'violin':
          textArray.push(link);
          break;
        case 'pie':
          textArray.push(link);
          break;
        case 'histogram':
          textArray.push(extractAndFormatDate(link));
          break;
        case 'heatmap':
          textArray[index].push(link);
          break;
        default:
          break;   
      }
    }
  }
  return textArray;
}

/**
 * Adds default hover text to the result object when hovertemplate_display_pattern is not configured 
 * Note: This fixes the issue of displaying link in hover text when tick_display is configured for x or y axis 
 * which was making the text hard to read in some plot types
 * @param result trace object to be updated
 */
const defaultHoverTemplateDisplay = (
  result: any,
): void => {
  const tempText: any[]=[];
  // console.log(result);
  if (result.data[0].type==='heatmap') {
    result.data[0].hoverinfo= 'text';
    result.data[0].z.forEach((zArr: any[],index: number)=>{
      tempText.push([]);
      zArr.forEach((val: any,i: number)=>{
        tempText[index].push(`x: ${extractValue(result.data[0].x[i])}`+'<br>'+`y: ${extractValue(result.data[0].y[index])}`+'<br>'+`z: ${val}`);
      })
    });
    result.data[0].text=tempText;
  }else if(result.data[0].type==='scatter'){
    result.data[0].hoverinfo= 'text';
    result.data[0].x.forEach((xVal:string)=>{
        tempText.push(`(${extractValue(xVal)||''}`);
    });
    result.data[0].y.forEach((yVal:string,ind:number)=>{
      const xValue = tempText[ind];
      tempText[ind]=`${xValue}, ${extractValue(yVal)||''})`;
    });
    result.data[0].text=tempText;
  }
  console.log(result);
}

/**
 * Sets the hovertext array and hoverinfo for all plots when hovertemplate_display_pattern is configured
 * @param result data object to be updated
 * @param textArray array of hover text
 * @param trace from plot configs
 */
const setHoverText = (result: any, textArray: any, trace:Trace) => {
  const hovertemplate_display_pattern = trace.hovertemplate_display_pattern; // use trace info
  if(hovertemplate_display_pattern){
    result.hovertext=textArray;
    result.hoverinfo='text';
  }
}
