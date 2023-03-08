import { useEffect, useState, useRef } from 'react';
import {
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
} from 'plotly.js';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import { formatPlotData, createLink } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import {
  Plot,
  PlotConfig,
  PlotConfigAxis,
  DataConfig,
  Trace,
  TraceConfig,
} from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

/**
 * Data received from API request
 */
type Response = {
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
type ResponseData = Array<any>;

/**
 * Data packed in result
 */
type PlotResultData = {
  x: string[] & number[];
  y: string[] & number[];
  text?: string[];
};

/**
 * Data packed in result
 */
export type PieResultData = {
  text: string[] & number[];
  labels: string[] & number[];
};

/**
 * Hook function to use plot data given a config object
 *
 * @param plotConfigs configuration object
 * @returns all data to be used by plot
 */
export const usePlotData = (plotConfigs: PlotConfig) => {
  const { dispatchError, errors } = useError();
  /**
   * raw data from endpoint
   */
  const [, setData] = useState<Array<ResponseData>>([]);
  /**
   * parsed data
   */
  const [parsedData, setParsedData] = useState<Array<any>>([]);
  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<DataConfig | null>(null);
  const setupStarted = useRef<boolean>(false);

  // Side Effect for Updating Config and Data
  useEffect(() => {
    const fetchData = async (config: DataConfig) => {
      // Loop through plots
      config.plots.forEach(async (plot) => {
        // Fulfill promise for each plot
        const plotResponses: Array<Response> = await Promise.all(
          // request for each trace
          plot.traces.map((trace) => {
            return ConfigService.http.get(trace.uri);
          })
        );

        // Parse and update the plot data on each succesful plot batch request
        if (plotResponses.length > 0) {
          const unpackedResponses = plotResponses.map((response: Response) => response.data); // unpack data
          setData((data) => [...data, unpackedResponses]);
          setParsedData((data) => [...data, parsePlotData(plot, unpackedResponses)]);
        }
      });
      setTypeConfig(config);
    };

    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(plotConfigs);
      fetchData(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [plotConfigs, dispatchError]);

  return {
    config: typeConfig,
    errors,
    parsedData,
  };
};

/**
 * Parses data for the unpackedResponses for every plot based on its type
 *
 * @param plot configs for a specific plot
 * @param unpackedResponses response data
 * @returns
 */
const parsePlotData = (plot: Plot, unpackedResponses: Array<ResponseData>) => {
  const result: any = { ...plot.plotly, data: [] };
  updatePlotlyConfig(plot, result);
  updatePlotlyLayout(plot, result);

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
      return parseViolinResponse(currTrace, plot, responseData);
    }
  });

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
const updatePlotlyLayout = (plot: Plot, result: any): void => {
  // title
  if (plot.config.title_display_markdown_pattern) {
    result.layout.title = createLink(plot.config.title_display_markdown_pattern);
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
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);
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
const parseViolinResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyViolinData> = {
    ...trace,
    type: 'violin',
    x: [],
    y: [],
    text: [],
  };

  // TODO: workon violin

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
    trace?.x_col?.forEach((colName) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x?.push(value.toString());
    });
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
  const result: Partial<TraceConfig> & Partial<PlotlyPieData> & PieResultData = {
    ...trace,
    type: plot.plot_type,
    hoverinfo: 'text+value+percent', // value to show on hover of a pie slice
    textinfo: 'value', // data shown on a pie slice
    labels: [],
    values: [],
    text: [],
    // legend_clickable_links: [], // TODO: confirm deprecated
    // graphic_clickable_links: [], // TODO: confirm deprecated
  };

  const { config } = plot;
  const { format_data = false } = config;

  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      if (Array.isArray(result.values)) {
        result.values.push(value);
      }
    }
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
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData = {
    ...trace,
    type: plot.plot_type,
    textposition: 'outside', // position of bar values
    hoverinfo: 'text', // value to show on hover of a bar
    x: [], // x data
    y: [], // y data
    text: [], // text data
    // legend_clickable_links: [], // TODO: confirm deprecated
    // graphic_clickable_links: [], // TODO: confirm deprecated
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

  // TODO: confirm deprecated
  // get legend clickable links
  // if (trace.legend_markdown_pattern) {
  //   const traceLinkWithContextParams = createLinkWithContextParams(
  //     trace.legend_markdown_pattern[i] || ''
  //   );
  //   result.legend_clickable_links.push(traceLinkWithContextParams);
  // }

  // TODO: confirm deprecated
  // Configure links for individual traces
  // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
  // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
  // if (trace.graphic_link_pattern) {
  //   const linkPattern = Array.isArray(trace.graphic_link_pattern)
  //     ? trace.graphic_link_pattern[0]
  //     : trace.graphic_link_pattern;
  //   result.graphic_clickable_links.push(createLink(linkPattern, templateParams));
  // }
};
