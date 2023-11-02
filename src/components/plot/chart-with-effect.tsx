// import '/node_modules/react-resizable/css/styles.css';
// import '/node_modules/react-grid-layout/css/styles.css';

// components
import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import FacetSearchPopupInput from '@isrd-isi-edu/deriva-webapps/src/components/plot/facet-search-popup-input';

// hooks
import { useState } from 'react';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// models
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps } from 'react-grid-layout';
import { LayoutConfig, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { LogStackPaths, LogStackTypes } from '@isrd-isi-edu/chaise/src/models/log';

// services
import { LogService } from '@isrd-isi-edu/chaise/src/services/log';

// utils
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

type ChartWithEffectProps = {
  /**
   * selectors data to be rendered
   */
  userControlData: {
    gridConfig: ResponsiveGridProps,
    layout: LayoutConfig[],
    userControlConfig: UserControlConfig[]
  };
  selectorOptions: Option[][];
  setSelectorOptionChanged: any;
  width: number | string;
};

// In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const ChartWithEffect = ({ userControlData, selectorOptions, setSelectorOptionChanged, width }: ChartWithEffectProps): JSX.Element => {
  const uid: string[] = [];
  const valueKey: string[] = [];
  const selectorValue: Option[] = [];

  const { templateParams, setTemplateParams } = usePlot();

  // Collect uid's and valueKey's for all selectors
  userControlData.userControlConfig?.map((currentConfig, index) => {
    const currUid = currentConfig?.uid;
    const currValueKey = currentConfig?.request_info.value_key;
    uid.push(currUid);
    valueKey.push(currValueKey);
    const selectedOption = selectorOptions[index]?.find((option: Option) =>
      option.value === templateParams.$control_values[currUid]?.values[currValueKey]);
    if (selectedOption) {
      selectorValue.push(selectedOption);
    }
  });

  const gridProps = convertKeysSnakeToCamel(userControlData.gridConfig);
  //Convert snake_case keys inside different selector's layout to camel case
  const mappedLayoutValues = Object.values(userControlData.layout)?.map((resLayout: any) => (
    resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
      //i defines the item on which the given layout will be applied
      i: item?.source_uid,
      ...item,
    })))
  ));

  const layoutObj = Object.fromEntries(Object.entries(userControlData.layout).map(([key, val], index) => [key, mappedLayoutValues[index]]));

  /**
   * It sets a new value in templateParams.$control_values based on selector, 
   * triggers the setSelectorOptionChanged function, and returns the option
   * @param option changed option
   * @param userControlConfig configuration of the given selector
   * @returns 
   */
  const handleChange = (option: Option, userControlConfig: UserControlConfig) => {
    if (option) {
      setSelectorOptionChanged(true);
      const uid = userControlConfig?.uid;
      const valueKey = userControlConfig?.request_info?.value_key;
      const tempParams = { ...templateParams }

      tempParams.$control_values[uid].values = {
        [valueKey]: option.value
      }

      setTemplateParams(tempParams);
      return option;
    }
  };

  const renderUserControls = () => {
    return (
      userControlData.userControlConfig?.map((config, idx) => {
        switch (config.type) {
          case 'dropdown':
            return (
              <div key={config.uid}>
                <DropdownSelect
                  id={uid[idx]}
                  defaultOptions={selectorOptions[idx]}
                  label={config?.label}
                  // Using any for option type instead of 'Option' to avoid the lint error
                  onChange={(option: any) => handleChange(option, config)}
                  value={selectorValue[idx]}
                />
              </div>
            )
          case 'facet-search-popup':
            return (
              <div key={config.uid}>
                <FacetSearchPopupInput
                  id={uid[idx]}
                  // defaultOptions={selectorOptions[idx]}
                  label={config?.label}
                  // TODO: default value if set on load from url
                  value={selectorValue[idx]}
                  userControlConfig={config}
                />
              </div>
            )
          default:
            break;
        }
      })
    )
  }

  return (
    <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
      <ResponsiveGridLayout className='grid-layout layout'
        layouts={layoutObj}
        {...gridProps}
      >
        {renderUserControls()}
      </ResponsiveGridLayout>
    </div>
  );

};

export default ChartWithEffect;
