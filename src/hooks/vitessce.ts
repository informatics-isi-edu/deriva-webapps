// hooks
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { useContext, useEffect, useState } from 'react';

// models
import { DerivaVitessceConfig, DerivaVitessceDataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce'
import { VitessceAppContext } from '@isrd-isi-edu/deriva-webapps/src/providers/vitessce-app';

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
      const config = getConfigObject(vitessceConfigs);
      setTypeConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [vitessceConfigs, dispatchError]);

  return { errors, config: typeConfig };
};

/**
 * useVitessce hook to be used for accessing vitessce provider
 * can be used in sub components to get the vitessce and control data
 * for list of properties take a look at VitessceAppContext value
 */
export function useVitessce() {
  const context = useContext(VitessceAppContext);
  if (!context) {
    throw new Error('No VitessceAppProvider found when calling VitessceAppContext');
  }
  return context;
}
