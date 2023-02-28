import { useEffect, useState, useRef } from 'react';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import {
  Plot,
  PlotConfig,
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
  const [data, setData] = useState<Array<any>>([]);
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
    const fetchData = async (typeConfig: PlotTypeConfig) => {
      // Loop through plots
      typeConfig.plots.forEach(async (plot) => {
        // Fulfill promises for each plot in batch
        const plotResponses: Array<Response> = await Promise.all(
          plot.traces.map((trace) => {
            return ConfigService.http.get(trace.uri);
          })
        );

        // Parse and update data on each succesful plot request
        if (plotResponses.length > 0) {
          const unpackedResponses = plotResponses.map((response: Response) => response.data);
          setData((data) => [...data, unpackedResponses]);
          setParsedData((data) => [...data, parsePlotData(plot, unpackedResponses)]);
        }
      });

      setTypeConfig(typeConfig);
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

const parsePlotData = (plot: Plot, unpackedResponses: Array<any>) => {
  const result: any = { ...plot.plotly, data: [] };
  if (plot?.plotly?.config?.modeBarButtonsToRemove) {
    result.layout.modebar = { remove: plot?.plotly?.config?.modeBarButtonsToRemove };
  }
  if (plot.plot_type === 'bar') {
    // Create and then append data traces to result
    result.data = unpackedResponses.map((responseData: any, i: number) =>
      parseBarResponse(plot.traces[i], plot, responseData)
    );
  }

  console.log('parsePlotData');
  console.log(result);

  return result;
};

const parseBarResponse = (trace: Trace, plot: Plot, responseData: any) => {
  const result: { type: string; name: any; x: Array<any>; y: Array<any> } = {
    ...trace,
    name: trace.legend ? trace.legend[0] : '',
    type: plot.plot_type,
    x: [],
    y: [],
  };

  responseData.forEach((item: any) => {
    trace?.x_col?.map((colName) => {
      const xVal = formatData(item[colName], plot.config.format_data_x, plot.plot_type);
      result.x.push(xVal);
    });
    trace?.y_col?.map((colName) => {
      result.y.push(item[colName]);
    });
  });

  console.log('parseBarResponse');
  console.log(result);

  return result;
};

const extractLink = (pattern: string) => {
  // Checking if the pattern contains link if yes then extract the link directly else
  let extractedLink = false;
  let match = null;
  if (pattern.includes('(') && pattern.includes(')')) {
    // Defined regex to extract url from the pattern defined in the configuration file
    // Example: [{{{ Number of records }}}](/deriva-webapps/plot/?config=gudmap-todate-pie){target=_blank}
    // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
    // Extracts all the characters placed between "( )".
    // "]/(" : find a ']' bracket followed by '('
    // "." : matches any character and
    // "*?" : matches the previous token between zero and unlimited times
    // "i" modifier :  insensitive. Case insensitive match (ignores case of [a-zA-Z])
    // "g" modifier :  global. All matches.
    const markdownUrlRegex = /]\((.*?)\)/gi;
    match = markdownUrlRegex.exec(pattern);
    extractedLink = match ? match[1] : false;
  } else if (pattern.includes('href')) {
    // Defined regex to extract url from the generated html element with href attribute
    // Example: <a href="(/deriva-webapps/plot/?config=gudmap-todate-pie" target="_blank">prostate gland</a>
    // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
    // Extracts a link from the anchor tag
    // "\s" : matches a space character
    // ^\n\r : matches a string that does not have new line or carriage return
    const htmlUrlRegex = /<a\shref="([^\n\r]*?)"/gi;
    match = htmlUrlRegex.exec(pattern);
    extractedLink = match ? match[1] : false;
  }

  // return false if no extracted link
  return extractedLink;
};

const formatData = (data: any, format: any, type: string) => {
  if (format) {
    try {
      const formatedData = parseInt(data.split(' ')[0], 10);
      if (isNaN(formatedData)) {
        return data;
      }
      if (type === 'pie') {
        return formatedData.toString();
      }
      // this regex is used to add a thousand separator in the number if possible
      return addComma(formatedData);
    } catch (e) {
      return data;
    }
  } else {
    if (type === 'pie' || typeof data !== 'number') {
      return data;
    }
    return addComma(data);
  }
};

const addComma = (data: any) => {
  // this regex is used to add a thousand separator in the number if possible
  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};
