// hooks
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { createContext, useEffect, useMemo, useRef, useState } from 'react';

// models
import { AppStyle, PlotTemplateParams, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';


export const PlotAppContext = createContext<{
  setConfig: Function;
  globalControlsInitialized: boolean;
  globalUserControlData: any;
  selectorOptionChanged: boolean;
  setSelectorOptionChanged: Function;
  templateParams: PlotTemplateParams;
  setTemplateParams: Function;
  appStyles: any,
} | null>(null);

type PlotAppProviderProps = {
  children: React.ReactNode;
};

export default function PlotAppProvider({
  children,
}: PlotAppProviderProps): JSX.Element {

  const [config, setConfig] = useState<any>(null);
  const [globalControlsInitialized, setGlobalControlsInitialized] = useState<boolean>(false);
  const [selectorOptionChanged, setSelectorOptionChanged] = useState<boolean>(false);
  const [templateParams, setTemplateParams] = useState<PlotTemplateParams>({
    $url_parameters: {},
    $control_values: {}
  });
  const [appStyles, setAppStyles] = useState({});
  const [globalUserControlData, setGlobalUserControlData] = useState<any>(null);

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

    const initGlobalControls = async () => {
      if (config.user_controls?.length > 0) {
        const tempParams = { ...templateParams };

        const tempUserControls = [...config.user_controls];
        for (let i = 0; i < config.user_controls.length; i++) {
          const controlConfig = { ...config.user_controls[i] };

          const values = await initalizeControlData(controlConfig);

          tempParams.$control_values[controlConfig.uid] = {
            values: values
          }
        }

        setGlobalUserControlData({
          userControlConfig: tempUserControls,
          gridConfig: config?.grid_layout_config,
          layout: config?.grid_layout_config?.layouts
        });

        setTemplateParams(tempParams);
      }

      setGlobalControlsInitialized(true);
    };

    try {
      initGlobalControls();
      if(config?.app_styles){
        const validAppStyles = Object.keys(config?.app_styles)
        .filter(key => Object.values<string>(AppStyle).includes(key))
        .reduce((obj:any, key) => {
            obj[key] = config?.app_styles[key];
            return obj;
        }, {});
        setAppStyles(validAppStyles);
      }
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
      setTemplateParams,
      appStyles
    };
  }, [
    globalControlsInitialized,
    globalUserControlData,
    selectorOptionChanged,
    templateParams,
    appStyles
  ]);

  return (
    <PlotAppContext.Provider value={providerValue}>
      {children}
    </PlotAppContext.Provider>
  )
}