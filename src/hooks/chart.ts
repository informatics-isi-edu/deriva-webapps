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

const initialTemplateParams = {
  $url_parameters: {
    Gene: {
      data: {
        NCBI_GeneID: '1', // TODO: deal with default value
      },
    },
    Study: [],
  },
};

const addUrlParameters = (
  templateParams: PlotTemplateParams,
  isMulti: boolean,
  paramKey: string,
  tupleData: any[]
) => ({
  ...templateParams,
  $url_parameters: {
    ...templateParams.$url_parameters,
    [paramKey]: isMulti
      ? tupleData.map((tuple: any) => ({ data: tuple.data }))
      : { data: tupleData[0].data },
  },
});

// TODO: template parameters can be removed and migrated to use this instead if initial template params are defined differently
const createTemplateParams = (selectData: any[][]) => {
  const $url_parameters: PlotTemplateParams['$url_parameters'] = {};
  flatten2DArray(selectData).forEach((cell: any) => {
    const { requestInfo, isMulti, urlParamKey, selectedRows } = cell;
    if (requestInfo) {
      if (isMulti) {
        $url_parameters[urlParamKey] = selectedRows;
      } else {
        $url_parameters[urlParamKey] = { data: selectedRows[0].data };
      }
    }
  });
  return { $url_parameters };
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
  const [isFetchSelected, setIsFetchSelected] = useState<boolean>(false);
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

  const { selectData, handleCloseModal, handleSubmitModal, fetchSelectData, setSelectData } =
    useChartSelectGrid(plot, {
      templateParams,
      setModalProps,
      setIsModalOpen,
      setIsFetchSelected,
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
    console.log('fetchInitEffect called');
    // selectData must be not null first cause it modifies templateParams
    if (isFirstRender) {
      console.log('inFirstRender');
      try {
        console.log('fetchInitData called');
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
      return parseViolinResponse(
        currTrace,
        plot,
        responseData,
        selectDataGrid,
        templateParams.noData
      );
    }
  });

  updatePlotlyConfig(plot, result); // update the config
  updatePlotlyLayout(plot, result, templateParams, selectDataGrid); // update the layout

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
  selectDataGrid?: any
): void => {
  // title
  if (plot.config.title_display_markdown_pattern) {
    result.layout.title = createLink(plot.config.title_display_markdown_pattern, templateParams);
  }
  if (templateParams.noData) {
    result.layout.title = 'No Data';
  }

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
  result.layout.xaxis.automargin = true;
  result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : '';
  result.layout.xaxis.ticksuffix = '  ';

  // y axis
  if (!result.layout.yaxis) {
    result.layout.yaxis = {};
  }

  // set yaxis type and title
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    // TODO: figure out cleaner way to do this
    if (Array.isArray(selectDataGrid)) {
      selectDataGrid.forEach((row: any) => {
        row.forEach((cell: any) => {
          if (cell.action === 'scale') {
            if (cell.value.value === 'log') {
              result.layout.yaxis.title = createLink(
                `log(${plot.config.yaxis?.title_display_markdown_pattern} + 1)`
              );
            } else {
              result.layout.yaxis.title = createLink(
                `${plot.config.yaxis?.title_display_markdown_pattern}`
              );
            }
            result.layout.yaxis.type = cell.value.value;
          }
        });
      });
    } else {
      result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);
    }
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
    text: [],
    x: [],
    y: [],
    legend_clickable_links: [],
    graphic_clickable_links: [],
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
    const xTicks = [];
    responseData.forEach((item: any, i: number) => {
      if (xGroupBy) {
        const groupByKey = xGroupBy.value.value;
        const xVal = item[groupByKey];
        const xTick = xGroupBy?.setting?.tick_display_markdown_pattern
          ? createLink(xGroupBy?.setting?.tick_display_markdown_pattern)
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
        updateWithTraceColData(result, trace, yItem, i);

        if (yScale.value.value === 'log') {
          const yVal = yItem + 1;
          y.push(yVal);
        } else {
          const yVal = yItem ? createLink(yItem.toString()) : yItem;
          y.push(yVal);
        }
      }
    });

    result.x = x;
    result.y = y;
    result.transforms = [
      {
        type: 'groupby',
        groups: x,
      },
    ];
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
    textinfo: 'value', // data shown on a pie slice
    labels: [],
    values: [],
    text: [],
    legend_clickable_links: [],
    graphic_clickable_links: [],
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
      const value = getValue(item, trace.legend_col, undefined, false, plot);
      result.text.push(item[trace.legend_col]);
      result.labels.push(value);
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
const updateWithTraceColData = (result: any, trace: Trace, item: any, index: number): void => {
  // legend name
  let name = trace.legend ? trace.legend[index] : '';
  if (trace.legend_markdown_pattern) {
    name = createLink(trace.legend_markdown_pattern[index] || '');
  }
  result.name = name;

  if (trace.legend_markdown_pattern) {
    const linkPattern = Array.isArray(trace.legend_markdown_pattern)
      ? trace.legend_markdown_pattern[index]
      : trace.legend_markdown_pattern;
    const extractedLink = createLinkWithContextParams(linkPattern);
    if (extractedLink) {
      result.legend_clickable_links.push(createLink(extractedLink, { $self: { data: item } }));
    }
  }

  if (trace.graphic_link_pattern) {
    const linkPattern = Array.isArray(trace.graphic_link_pattern)
      ? trace.graphic_link_pattern[0]
      : trace.graphic_link_pattern;
    if (linkPattern) {
      result.graphic_clickable_links.push(createLink(linkPattern, { $self: { data: item } }));
    }
  }
};
