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
  x: string[] & number[];
  y: string[] & number[];
  text?: string[];
};

export type ClickableLinks = {
  graphic_clickable_links: string[];
  legend_clickable_links: string[];
};

/**
 * Data packed in result
 */
export type PieResultData = {
  text: string[] & number[];
  labels: string[] & number[];
};

export type PlotTemplateParams = {
  $url_parameters: {
    [paramKey: string]: any;
  };
  noData: boolean;
};

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
 * Hook function to use plot config object
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

  // TODO: change this to a more local scope and don't hardcode the values
  const templateParams: PlotTemplateParams = useMemo(
    () => ({
      $url_parameters: {
        Gene: {
          data: {
            NCBI_GeneID: '1', // TODO: deal with default value
          },
        },
        Study: [],
      },
      noData: false, // TODOL: remove hack when empty selectedRows are fixed
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
  } = useChartSelectGrid({
    templateParams,
    setModalProps,
    setIsModalOpen,
  });

  const fetchData = useCallback(async () => {
    // Fulfill promise for plot
    const plotResponses: Array<Response> = await Promise.all(
      // request for each trace
      plot.traces.map((trace) => {
        if (trace.uri) {
          return ConfigService.http.get(trace.uri);
        } else if (trace.queryPattern) {
          const { uri, headers } = getPatternUri(trace.queryPattern, templateParams);
          return ConfigService.http.get(uri, { headers });
        } else {
          return { data: [] };
        }
      })
    );

    return plotResponses.map((response: Response) => response.data); // unpack data
  }, [plot, templateParams]);

  // Effect to fetch data
  useEffect(() => {
    const fetchInitData = async () => {
      setIsInitLoading(true);
      if (plot.plot_type === 'violin') {
        const selectGrid = createStudyViolinSelectGrid(plot);
        const initialSelectData = await fetchSelectData(selectGrid);
        setSelectData(initialSelectData);
      }

      const plotData = await fetchData();
      setData(plotData);
      setIsInitLoading(false);
    };
    // selectData must be not null first cause it modifies templateParams
    if (isFirstRender) {
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

  // Effect to fetch data on selectData changes
  useEffect(() => {
    const fetchSubsequentData = async () => {
      setIsDataLoading(true);
      const plotData = await fetchData();
      setData(plotData);
      setIsDataLoading(false);
    };

    // selectData must be not null first cause it modifies templateParams
    if (!isFirstRender && isFetchSelected) {
      try {
        fetchSubsequentData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [isFirstRender, isFetchSelected, selectData, templateParams, fetchData, dispatchError]);

  // Parse data on state changes to data and selectData
  useEffect(() => {
    if (data) {
      setIsParseLoading(true);
      const parsedPlotData = parsePlotData(plot, data, selectData, templateParams);
      setParsedData(parsedPlotData);
      setIsParseLoading(false);
    }
  }, [plot, data, selectData, templateParams]);

  return {
    isInitLoading,
    isDataLoading,
    isParseLoading,
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
  const result: any = { ...plot.plotly, data: [] };
  let additionalLayout = {};

  // Add all plot "traces" to data array based on plot type
  result.data = unpackedResponses.map((responseData: ResponseData, index: number) => {
    const currTrace = plot.traces[index];
    if (plot.plot_type === 'bar') {
      return parseBarResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'pie') {
      return parsePieResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'scatter') {
      return parseScatterResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'histogram') {
      return parseHistogramResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'violin') {
      const { result, layout } = parseViolinResponse(
        currTrace,
        plot,
        responseData,
        selectDataGrid,
        templateParams.noData
      );
      additionalLayout = layout;
      return result;
    }
  });

  updatePlotlyConfig(plot, result); // update the config
  updatePlotlyLayout(plot, result, templateParams, additionalLayout, selectDataGrid); // update the layout

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
  result.config.responsive = Boolean(plot.config.responsive);
};

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
  parsedLayout?: any,
  selectDataGrid?: any
): void => {
  // title
  let title = '';
  if (plot.config.title_display_markdown_pattern) {
    title = createLink(plot.config.title_display_markdown_pattern, templateParams);
    console.log('title link', title);
  }
  if (templateParams.noData) {
    title = 'No Data';
  }
  result.layout.title = title;

  // legend
  if (plot.config.disable_default_legend_click) {
    result.layout.disable_default_legend_click = plot.config.disable_default_legend_click;
  }

  // x axis
  if (!result.layout.xaxis) {
    result.layout.xaxis = {};
  }
  if (plot.config.xaxis?.title_display_markdown_pattern) {
    result.layout.xaxis.title = createLink(plot.config.xaxis.title_display_markdown_pattern);
  }
  if (parsedLayout?.xaxis?.tickvals) {
    result.layout.xaxis.tickmode = 'array';
    result.layout.xaxis.tickvals = parsedLayout.xaxis.tickvals;
    console.log('parsedlayoutres tickvals', result.layout.xaxis.tickvals);
  }
  if (parsedLayout?.xaxis?.ticktext) {
    result.layout.xaxis.ticktext = parsedLayout.xaxis.ticktext;
    console.log('parsedlayoutres ticktext', parsedLayout.xaxis.ticktext);
  }
  if (selectDataGrid) {
    const xaxisTitle = getSelectGroupByAxisTitle(selectDataGrid, 'x');
    if (xaxisTitle) {
      result.layout.xaxis.title = xaxisTitle;
    }
  }

  result.layout.xaxis.automargin = true;
  result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : '';
  result.layout.xaxis.ticksuffix = '  ';

  // y axis
  if (!result.layout.yaxis) {
    result.layout.yaxis = {};
  }
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);

    // TODO: figure out cleaner way to do this
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
  }

  result.layout.yaxis.automargin = true;
  result.layout.yaxis.ticksuffix = '  ';

  // buttons
  if (plot?.plotly?.config?.modeBarButtonsToRemove) {
    result.layout.modebar = { remove: plot?.plotly?.config?.modeBarButtonsToRemove };
  }
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
    x: [],
    y: [],
    legend_clickable_links: [],
    graphic_clickable_links: [],
    hovertemplate: '',

    // todo: maybe migrate the params below to config
    points: 'all',
    pointpos: 0,
    box: {
      visible: true,
    },
    meanline: {
      visible: true,
    },
    line: {
      width: 1,
    },
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
    responseData.forEach((item: any, i: number) => {
      if (xGroupBy) {
        const groupByKey = xGroupBy.value.value;
        const xGroupItem = xGroupBy.groupKeysMap[groupByKey];
        updateWithTraceColData(result, trace, item, i, xGroupItem);

        const xVal = item[groupByKey];
        const xTick = xGroupItem?.tick_display_markdown_pattern
          ? createLink(xGroupItem?.tick_display_markdown_pattern, { $row: item })
          : xVal;
        if (xVal !== null && xVal !== undefined) {
          x.push(xVal);
        }
        if (xTick !== null && xTick !== undefined) {
          xTicks.push(xTick);
        }
      }

      if (yScale) {
        const yItem = item[yScale.setting.group_key];
        if (yScale.value.value === 'log') {
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
    });

    console.log('x', x);
    console.log('y', y);

    result.x = x;
    result.y = y;

    result.transforms = [
      {
        type: 'groupby',
        groups: x,
      },
    ];

    layout.xaxis = { tickvals: x, ticktext: xTicks };
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

  const dataPoints: Array<any> = [];
  responseData.forEach((item: any) => {
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      dataPoints.push(value);
    }
  });

  // Add data to correct axis depending on orientation
  if (trace.orientation === 'h') {
    result.y = dataPoints;
  } else if (trace.orientation === 'v') {
    result.x = dataPoints;
  }

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
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData = {
    ...trace,
    mode: 'markers',
    name: trace.legend ? trace.legend[0] : '',
    type: plot.plot_type,
    text: [],
    x: [],
    y: [],
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // why is format_data_x not in xaxis?

  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    // Add X data
    trace?.x_col?.forEach((colName) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x?.push(value.toString());
    });
    // Add Y data
    trace?.y_col?.forEach((colName) => {
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y?.push(value.toString());
    });
  });

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
    labels: [],
    text: [], // text to show on hover of a pie slice
    values: [], // array of links / elements for the legend
    legend_clickable_links: [], // array of links for when clicking legend
    graphic_clickable_links: [], // array of links for when clicking graph
  };

  const { config } = plot;
  const { format_data = false } = config;
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
        console.log('pie legend_markdown_pattern link', textValue);
      }
      result.text.push(textValue);
      result.labels.push(labelValue);
    }
  });

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
    legend_clickable_links: [],
    graphic_clickable_links: [],
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // why is format_data_x not in xaxis?

  responseData.forEach((item: any) => {
    // Add the x values for the bar plot
    trace?.x_col?.forEach((colName, i: number) => {
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
    trace?.y_col?.forEach((colName, i: number) => {
      if (trace.orientation === 'v') {
        // update the trace data if orientation is vertical
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text?.push(textValue.toString());
      }
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y.push(value.toString());
    });
  });
  return result;
};

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

// click events
// https://plotly.com/javascript/click-events/

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
    trace.legend_markdown_pattern || extraInfo?.legend_markdown_pattern;
  if (legend_markdown_pattern) {
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

  const graphic_link_pattern = trace.graphic_link_pattern || extraInfo?.graphic_link_pattern;
  if (graphic_link_pattern) {
    const linkPattern = Array.isArray(graphic_link_pattern)
      ? graphic_link_pattern[0]
      : graphic_link_pattern;
    if (linkPattern) {
      const link = createLink(linkPattern, { $self: { data: item } });
      if (link) {
        result.graphic_clickable_links.push(link);
      }
    }
  }
};
