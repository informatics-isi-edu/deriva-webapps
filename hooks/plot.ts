import { useEffect, useState, useRef } from 'react';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

/**
 * Hook function to use plot data given a config object
 *
 * @param plotConfigs
 * @returns all data to be used by plot
 */
export const usePlotData = (plotConfigs: any) => {
  const { dispatchError, errors } = useError();
  /**
   * config object state
   */
  const [config, setConfig] = useState<any>(null);
  const setupStarted = useRef<boolean>(false);

  // Side Effect for Updating Config
  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(plotConfigs);
      setConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [plotConfigs, dispatchError]);

  return {
    config,
    errors,
  };
};
