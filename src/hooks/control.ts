// hooks
import { useEffect, useState } from 'react';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// models
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';

type UserControlGridProps = {
  /**
   * selectors data to be rendered
   */
  userControlConfig: UserControlConfig[];
};

/**
 * Hook function to handle the needed data to be used by the selectors
 *
 * @param configData object with 3 properties:
 *    - `userControlConfig` the selector configuration
 *    - `setDataOptions` a function used for setting a useState variable in `chart.ts`
 */
export const useUserControls = (configData: UserControlGridProps) => {
  const { templateParams, setTemplateParams } = usePlot();

  useEffect(() => {
    setControlData();
    // get data options and update them in chart.ts
    getDataOptions().then((allDataOptions) => {
      // do nothing
    });
  }, []);

  /**
 * This function retrieves dropdown options from its configuration, 
 * mapping them into an array of label-value pairs, and returns an array of arrays containing these options.
 * @returns array of arrays containing these options
 */
  const getDataOptions = async () => {
    /**
     * This handles 3 cases for returning the data for the user control in this order
     *   1. reference.read
     *   2. http.get
     *   3. data.map
     * 
     * Note: each case is handled differently
     *   1. if the `request_info.url_pattern` contains `/entity/` we can assume it is entity API
     *     - use ERMrest.resolve() to create a 'reference'
     *     - reference.read() to get the rows of data
     *     - not all `/entity/` _need_ to use reference API
     *       - how do we distinguish this?
     *       - add property to request_info, `request_info.api` = 'reference' | 'http' | 'data'
     *       - data is implied since it is already a different property from url_pattern
     *   2. if the `request_info.url_pattern` does NOT contain `/entity/` we can't use reference
     *     - use ConfigService.http.get to fetch data from the url_pattern and use as is
     *   3. if there is no `request_info.url_pattern`, use `request_info.data` if defined
     */
    const allSelectorDataOptions: Option[][] = [];
    // iterate over each control config to initialize all controls
    for (let i = 0; i < configData.userControlConfig?.length; i++) {
      const currentConfig = configData.userControlConfig[i];

      switch (currentConfig.type) {
        case 'facet-search-popup':
        case 'button-facet-search-popup':
          // TODO: handle "-multi" cases unless that is a separate property
          // do
          continue;
        default:
          break;
      }

      let dataOptions;
      const dropdownOptions: { label: any; value: any; }[] = [];

      // if (currentConfig.request_info.url_pattern) {
      //   const pattern = currentConfig.request_info.url_pattern;
      //   const { uri, headers } = getPatternUri(pattern, templateParams);

      //   // if (pattern.includes('/entity/') && currentConfig.request_info.api === 'reference') {
      //     // case 1
      //     const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
      //     const ref = resolvedRef.contextualize.compactSelect;
      //     // TODO: use the right page size
      //     const page = await ref.read(25);
      //     dataOptions = page.tuples;
      //   // } else {
      //   //   // case 2
      //   //   const response = await ConfigService.http.get(uri, headers);
      //   //   return response.data;
      //   // }
      // } else {
      // case 3
      dataOptions = currentConfig?.request_info?.data;
      // }

      dataOptions?.map((option: any) => {
        // create a temporary template params object and add $self to it before templating
        const selfTemplateParams = { ...templateParams };
        selfTemplateParams['$self'] = { values: option }

        // both `selected_value_pattern` ans `value_key` are required properties
        const valuePattern = currentConfig?.request_info?.selected_value_pattern
        const displayValue = ConfigService.ERMrest.renderHandlebarsTemplate(valuePattern, selfTemplateParams);

        dropdownOptions.push({ 'label': displayValue, 'value': option[currentConfig?.request_info?.value_key] });
      });
      allSelectorDataOptions.push(dropdownOptions);
    }

    return allSelectorDataOptions;
  }

  /**
   * It iterates through its selectorConfig for multiple selectors. 
   * For each configuration, it extracts values for the selector and sets them in $control_values object within templateParams under the selector's uid
   * and then returns the modified templateParams.
   * 
   * @param configData Selector configuration, template params and setDataOptions state method
   * @returns modified templateParams
   */
  const setControlData = () => {
    const tempParams = { ...templateParams };
    configData.userControlConfig?.map((currentConfig: UserControlConfig) => {
      const paramKey = currentConfig?.url_param_key;
      const uid = currentConfig?.uid;
      const valueKey = currentConfig?.request_info?.value_key;
      const defaultValue = currentConfig?.request_info?.default_value;

      const values: any = {};
      // use url_param value if defined, fall back to default value if not
      if (paramKey) {
        const paramValue = getQueryParam(windowRef.location.href, paramKey);
        if (paramValue) values[valueKey] = paramValue;
      } else if (defaultValue) {
        values[valueKey] = defaultValue;
      }

      tempParams.$control_values[uid] = { values }
    });

    setTemplateParams(tempParams)

    // NOTE: this does nothing...
    return tempParams;
  }
};

export const useUserControl = (config: UserControlConfig) => {
  const { templateParams, setTemplateParams } = usePlot();

  const [controlData, setControlData] = useState<any>([]);
  const [initialized, setInitialized] = useState<boolean>(false)

  useEffect(() => {
    initalizeControlData();
    getDataOptions().then((dataOptions) => {
      setInitialized(true);
      setControlData(dataOptions);
    });
  }, []);

  /**
 * This function retrieves dropdown options from its configuration, 
 * mapping them into an array of label-value pairs, and returns an array of arrays containing these options.
 * @returns array containing these options
 */
  const getDataOptions = async () => {
    /**
     * This handles 3 cases for returning the data for the user control in this order
     *   1. reference.read
     *   2. http.get
     *   3. data.map
     * 
     * Note: each case is handled differently
     *   1. if the `request_info.url_pattern` contains `/entity/` we can assume it is entity API
     *     - use ERMrest.resolve() to create a 'reference'
     *     - reference.read() to get the rows of data
     *     - not all `/entity/` _need_ to use reference API
     *       - how do we distinguish this?
     *       - add property to request_info, `request_info.api` = 'reference' | 'http' | 'data'
     *       - data is implied since it is already a different property from url_pattern
     *   2. if the `request_info.url_pattern` does NOT contain `/entity/` we can't use reference
     *     - use ConfigService.http.get to fetch data from the url_pattern and use as is
     *   3. if there is no `request_info.url_pattern`, use `request_info.data` if defined
     */

    switch (config.type) {
      case 'facet-search-popup':
      case 'button-facet-search-popup':
        // TODO: handle "-multi" cases unless that is a separate property
        return;
      default:
        break;
    }

    let dataOptions;
    const dropdownOptions: Option[] = [];

    // if (currentConfig.request_info.url_pattern) {
    //   const pattern = currentConfig.request_info.url_pattern;
    //   const { uri, headers } = getPatternUri(pattern, templateParams);

    //   // if (pattern.includes('/entity/') && currentConfig.request_info.api === 'reference') {
    //     // case 1
    //     const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    //     const ref = resolvedRef.contextualize.compactSelect;
    //     // TODO: use the right page size
    //     const page = await ref.read(25);
    //     dataOptions = page.tuples;
    //   // } else {
    //   //   // case 2
    //   //   const response = await ConfigService.http.get(uri, headers);
    //   //   return response.data;
    //   // }
    // } else {
    // case 3
    dataOptions = config.request_info?.data;
    // }

    dataOptions?.map((option: any) => {
      // create a temporary template params object and add $self to it before templating
      const selfTemplateParams = { ...templateParams };
      selfTemplateParams['$self'] = { values: option }

      // both `selected_value_pattern` ans `value_key` are required properties
      const valuePattern = config.request_info?.selected_value_pattern
      const displayValue = ConfigService.ERMrest.renderHandlebarsTemplate(valuePattern, selfTemplateParams);

      dropdownOptions.push({ 'label': displayValue, 'value': option[config.request_info?.value_key] });
    });

    return dropdownOptions;
  }

  /**
   * It iterates through its selectorConfig for multiple selectors. 
   * For each configuration, it extracts values for the selector and sets them in $control_values object within templateParams under the selector's uid
   * and then returns the modified templateParams.
   * 
   * @param configData Selector configuration, template params and setDataOptions state method
   * @returns modified templateParams
   */
  const initalizeControlData = () => {
    const tempParams = { ...templateParams };

    const paramKey = config.url_param_key;
    const valueKey = config.request_info?.value_key;
    const defaultValue = config.request_info?.default_value;

    const values: any = {};
    // use url_param value if defined, fall back to default value if not
    if (paramKey) {
      const paramValue = getQueryParam(windowRef.location.href, paramKey);
      if (paramValue) values[valueKey] = paramValue;
    } else if (defaultValue) {
      values[valueKey] = defaultValue;
    }

    tempParams.$control_values[config.uid] = { values }

    setTemplateParams(tempParams)
  }

  return {
    controlData,
    initialized
  };
};