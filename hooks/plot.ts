import { useEffect, useState, useRef } from 'react';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import { PlotConfig, PlotTypeConfig } from '../src/models/plot-config';

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
  const [data, setData] = useState<any>();
  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<PlotTypeConfig | null>(null);
  const setupStarted = useRef<boolean>(false);

  // Side Effect for Updating Config
  useEffect(() => {
    const fetchData = async (typeConfig: PlotTypeConfig) => {
      const dataRequests = typeConfig.plots.map((plot) => {
        plot.traces.map((trace) => {
          return ConfigService.http.get(trace.uri);
        });
      });

      const data = await Promise.all(dataRequests);

      console.log("logging data");
      console.log(data);

      setTypeConfig(typeConfig);
      setData(data);
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
  };
};
