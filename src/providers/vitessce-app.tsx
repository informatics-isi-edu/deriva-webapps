// hooks
import { createContext, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// models
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { getQueryParam, getQueryParams } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { generateUid } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';


export const VitessceAppContext = createContext<{
  setConfig: Function;
  globalControlsInitialized: boolean;
  globalUserControlData: any;
  selectorOptionChanged: boolean;
  setSelectorOptionChanged: (optionChanged: boolean) => void;
  templateParams: VitessceTemplateParams;
  setTemplateParams: (templateParams: VitessceTemplateParams) => void;
} | null>(null);

type VitessceAppProviderProps = {
  children: React.ReactNode;
};

export default function VitessceAppProvider({
  children,
}: VitessceAppProviderProps): JSX.Element {

  const [config, setConfig] = useState<any>(null);
  const [globalUserControlData, setGlobalUserControlData] = useState<any>(null);
  const [globalControlsInitialized, setGlobalControlsInitialized] = useState<boolean>(false);
  const [selectorOptionChanged, setSelectorOptionChanged] = useState<boolean>(false);
  const [templateParams, setTemplateParams] = useState<VitessceTemplateParams>({
    $url_parameters: {},
    $control_values: {}
  });

  const { dispatchError } = useError();

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  /**
  * It should be called once to initialize the configuration data for the user controls into the state variable
  */
  useEffect(() => {
    if (setupStarted.current || !config) return;
    setupStarted.current = true;

    const tempParams = { ...templateParams };
    const allQueryParams = getQueryParams(window.location.href);

    // push query parameters into templating environment
    Object.keys(allQueryParams).forEach((key: string) => {
      tempParams.$url_parameters[key] = allQueryParams[key];
    });

    const initGlobalControls = async () => {
      if (config.user_controls?.length > 0) {
        const tempUserControls = [...config.user_controls];
        for (let i = 0; i < config.user_controls.length; i++) {
          const controlConfig = { ...config.user_controls[i] };
          if (!controlConfig.uid) {
            controlConfig.uid = generateUid('global', controlConfig.type, i)
            tempUserControls[i] = controlConfig;
          }

          const values = await initalizeControlData(controlConfig);

          tempParams.$control_values[controlConfig.uid] = {
            values: values
          }
        }

        setGlobalUserControlData({
          userControlConfig: tempUserControls,
          gridConfig: config?.grid_layout_config,
          layout: config?.layout
        });

        setTemplateParams(tempParams);
      }

      setGlobalControlsInitialized(true);
    };

    try {
      initGlobalControls();
    } catch (error) {
      dispatchError({ error });
    }
  }, [config]);

  /**
   * extracts values for the selector returns them for the templateParams under the selector's uid
   * 
   * @param config User Control configuration
   * @returns values for intializing template params for control
   */
  const initalizeControlData = async (config: UserControlConfig) => {
    const paramKey = config.url_param_key;
    const valueKey = config.request_info?.value_key;
    const defaultValue = config.request_info?.default_value;

    let values: any = {};
    // use url_param value if defined, fall back to default value if not
    let paramValue;
    if (paramKey) paramValue = getQueryParam(windowRef.location.href, paramKey);

    let initValue;
    if (paramValue) {
      initValue = paramValue;
    } else if (defaultValue) {
      initValue = defaultValue;
    }
    values[valueKey] = initValue;

    if (config.request_info.url_pattern) {
      const initRowRequest = config.request_info.url_pattern + '/' + valueKey + '=' + initValue;
      const response = await ConfigService.http.get(initRowRequest);

      values = response.data[0];
    }

    return values;
  }


  const providerValue = useMemo(() => {
    return {
      setConfig,
      globalControlsInitialized,
      globalUserControlData,
      selectorOptionChanged,
      setSelectorOptionChanged,
      templateParams,
      setTemplateParams
    };
  }, [
    globalControlsInitialized,
    globalUserControlData,
    selectorOptionChanged,
    templateParams
  ]);

  return (
    <VitessceAppContext.Provider value={providerValue}>
      {children}
    </VitessceAppContext.Provider>
  )
}