// hooks
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { useEffect, useState } from 'react';

// models
import { DerivaVitessceConfig, DerivaVitessceDataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce'

// utils
import { getConfigObject } from '@isrd-isi-edu/chaise/src/utils/config';

/**
 * Sets the vitessce configs
 *
 * @param vitessceConfigs
 */
export const useVitessceConfig = (vitessceConfigs: DerivaVitessceConfig) => {
  const { dispatchError, errors } = useError();

  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<DerivaVitessceDataConfig | null>(null);

  useEffect(() => {
    try {
      // TODO use chaise function instead of deriva-webapps one
      const config = getConfigObject<DerivaVitessceDataConfig>(vitessceConfigs);
      setTypeConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [vitessceConfigs, dispatchError]);

  return { errors, config: typeConfig };
};