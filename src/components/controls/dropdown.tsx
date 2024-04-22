// components
import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';

// hooks
import { useEffect, useState } from 'react';

// models
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';

// utils
import { useUserControl } from '@isrd-isi-edu/deriva-webapps/src/hooks/control';

/**
 * DropdownSelectProps is the type of props for DropdownSelect component.
 */
export type DropdownProps = {
  /**
   * value for the select input
   */
  value?: any;
  userControlConfig: UserControlConfig;
  setSelectorOptionChanged: (optionChanged: boolean) => void;
  templateParams: PlotTemplateParams | VitessceTemplateParams;
  setTemplateParams: (templateParams: PlotTemplateParams | VitessceTemplateParams) => void;
};

/**
 * DropdownSelect is a component that renders a dropdown select input.
 */
const Dropdown = ({
  value,
  userControlConfig,
  setSelectorOptionChanged,
  templateParams,
  setTemplateParams
}: DropdownProps): JSX.Element => {

  const [selectedValue, setSelectedValue] = useState<any>(value);

  // hook to setup data for control
  const { controlData, initialized } = useUserControl(userControlConfig, templateParams);

  useEffect(() => {
    if (!initialized) return;

    if (controlData.length > 0) {
      const currUid = userControlConfig.uid;
      const currValueKey = userControlConfig.request_info.value_key;

      const selectedOption = controlData.find((option: Option) => {
        return option.value === templateParams.$control_values[currUid]?.values[currValueKey]
      });

      if (selectedOption) setSelectedValue(selectedOption);
    }
  }, [initialized])

  /**
   * It sets a new value in templateParams.$control_values based on selector, 
   * triggers the setSelectorOptionChanged function, and returns the option
   * @param option changed option
   * @returns 
   */
  const handleChange = (option: Option) => {
    if (option) {
      const uid = userControlConfig?.uid;
      const valueKey = userControlConfig?.request_info?.value_key;
      const tempParams = { ...templateParams }

      tempParams.$control_values[uid].values = {
        [valueKey]: option.value
      }

      setTemplateParams(tempParams);
      setSelectedValue(option);

      setSelectorOptionChanged(true);
    }
  };

  return (
    <DropdownSelect
      id={userControlConfig.uid}
      defaultOptions={controlData}
      // label={userControlConfig.label.markdown_pattern}
      // Using any for option type instead of 'Option' to avoid the lint error
      onChange={(option: any) => handleChange(option)}
      value={selectedValue}
    />

  );
};

export default Dropdown;