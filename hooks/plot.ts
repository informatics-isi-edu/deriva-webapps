import { useEffect, useState, useRef } from 'react';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import {
  formatPlotData,
  getLink,
  getLinkWithContextParams,
} from '@isrd-isi-edu/deriva-webapps/src/utils/string';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import {
  Plot,
  PlotConfig,
  PlotConfigAxis,
  PlotTypeConfig,
  Trace,
} from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

type Response = {
  data: Array<any>;
  status: number;
};

/**
 * Hook function to use plot data given a config object
 *
 * @param plotConfigs
 * @returns all data to be used by plot
 */
export const usePlotData = (plotConfigs: PlotConfig) => {
  const { dispatchError, errors } = useError();
  /**
   * raw data from endpoint
   */
  const [, setData] = useState<Array<any>>([]);
  /**
   * parsed data
   */
  const [parsedData, setParsedData] = useState<Array<any>>([]);
  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<PlotTypeConfig | null>(null);
  const setupStarted = useRef<boolean>(false);

  // Side Effect for Updating Config and Data
  useEffect(() => {
    const fetchData = async (config: PlotTypeConfig) => {
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
 * @param plot
 * @param unpackedResponses
 * @returns
 */
const parsePlotData = (plot: Plot, unpackedResponses: Array<any>) => {
  const result: any = { ...plot.plotly, data: [] };
  updatePlotlyConfig(plot, result);
  updatePlotlyLayout(plot, result);

  // Add all plot "traces" to data array based on plot type
  result.data = unpackedResponses.map((responseData: any, i: number) => {
    const currTrace = plot.traces[i];
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
 * @param plot
 * @param result
 */
const updatePlotlyConfig = (plot: Plot, result: any) => {
  result.config.displaylogo = Boolean(plot.config.displaylogo);
  result.config.responsive = Boolean(plot.config.responsive);
};

/**
 * Updates the plotly layout based on given plot configs
 *
 * @param plot
 * @param result
 */
const updatePlotlyLayout = (plot: Plot, result: any) => {
  // title
  if (plot.config.title_display_markdown_pattern) {
    result.layout.title = getLink(plot.config.title_display_markdown_pattern);
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
    result.layout.xaxis.title = getLink(plot.config.xaxis.title_display_markdown_pattern);
  }
  result.layout.xaxis.automargin = true;
  result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : '';
  result.layout.xaxis.ticksuffix = '  ';

  // y axis
  if (!result.layout.yaxis) {
    result.layout.yaxis = {};
  }
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    result.layout.yaxis.title = getLink(plot.config.yaxis.title_display_markdown_pattern);
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
 * @param trace
 * @param plot
 * @param responseData
 * @returns
 */
const parseViolinResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: any = {
    ...trace,
    type: 'violin',
    x: [],
    y: [],
    text: [],
    labels: [],
    legend_clickable_links: [],
  };

  // TODO: workon violin

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace
 * @param plot
 * @param responseData
 * @returns
 */
const parseHistogramResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: any = {
    ...trace,
    type: 'histogram',
  };

  const dataPoints: Array<any> = [];
  responseData.forEach((item: any) => {
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, plot.config.format_data, plot);
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
 * @param trace
 * @param plot
 * @param responseData
 * @returns
 */
const parseScatterResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: any = {
    ...trace,
    type: plot.plot_type,
    x: [],
    y: [],
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x, format_data_y } = config; // why is format_data_x not in xaxis?

  result.mode = 'markers';
  result.name = trace.legend;
  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    trace?.x_col?.forEach((colName) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x.push(value);
    });
    trace?.y_col?.forEach((colName) => {
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y.push(value);
    });
  });

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace
 * @param plot
 * @param responseData
 * @returns
 */
const parsePieResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: any = {
    ...trace,
    type: plot.plot_type,
    hoverinfo: 'text+value+percent',
    textinfo: 'value',
    labels: [],
    values: [],
    text: [],
    legend_clickable_links: [], // An array which will hold all the links required for legends
    graphic_clickable_links: [], // An array which will hold all the links required for on click event of graph
  };

  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, plot.config.format_data, plot);
      result.values.push(value);
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
 * @param trace
 * @param plot
 * @param responseData
 * @returns
 */
const parseBarResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: any = {
    ...trace,
    type: plot.plot_type,
    textposition: 'outside',
    hoverinfo: 'text',
    x: [],
    y: [],
    text: [],
    legend_clickable_links: [],
    graphic_clickable_links: [],
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x, format_data_y } = config; // why is format_data_x not in xaxis?

  responseData.forEach((item: any) => {
    // Add the x values for the bar plot
    trace?.x_col?.forEach((colName, i: number) => {
      if (trace.orientation === 'h') {
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text.push(textValue);
      }
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x.push(value);
    });

    // Add the y values for the bar plot
    trace?.y_col?.forEach((colName, i: number) => {
      if (trace.orientation === 'v') {
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text.push(textValue);
      }
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y.push(value);
    });
  });
  return result;
};

/**
 * Gets the value in the form of a link from the given markdown pattern.
 * Optionally formats the value.
 *
 * @param item
 * @param colName
 * @param axis
 * @param formatData
 * @param plot
 * @returns
 */
const getValue = (
  item: any,
  colName: string,
  axis: PlotConfigAxis | undefined,
  formatData: boolean | undefined,
  plot: Plot
) => {
  let value = item[colName];
  if (axis?.tick_display_markdown_pattern) {
    value = getLink(axis.tick_display_markdown_pattern, { $self: { data: item } });
  }
  return formatPlotData(value, formatData, plot.plot_type);
};

/**
 * Updates the trace with given the given trace passed in from plot-cnofig and the item data
 *
 * @param result
 * @param trace
 * @param item
 * @param i
 */
const updateWithTraceColData = (result: any, trace: Trace, item: any, i: number) => {
  const templateParams = { $self: { data: item } };

  // legend name
  let name = trace.legend ? trace.legend[i] : '';
  if (trace.legend_markdown_pattern) {
    name = getLink(trace.legend_markdown_pattern[i] || '');
  }
  result.name = name;

  // get legend clickable links
  if (trace.legend_markdown_pattern) {
    const traceLinkWithContextParams = getLinkWithContextParams(
      trace.legend_markdown_pattern[i] || ''
    );
    result.legend_clickable_links.push(traceLinkWithContextParams);
  }

  // Configure links for individual traces
  // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
  // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
  if (trace.graphic_link_pattern) {
    const linkPattern = Array.isArray(trace.graphic_link_pattern)
      ? trace.graphic_link_pattern[0]
      : trace.graphic_link_pattern;
    result.graphic_clickable_links.push(getLink(linkPattern, templateParams));
  }
};
