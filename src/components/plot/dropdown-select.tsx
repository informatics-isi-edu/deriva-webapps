import { MouseEventHandler } from 'react';
import { ActionMeta, OnChangeValue } from 'react-select';

import SelectView from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-view';
import SelectInput from '@isrd-isi-edu/deriva-webapps/src/components/select-input';

/**
 * DropdownSelectProps is the type of props for DropdownSelect component.
 */
export type DropdownSelectProps = {
  /**
   * label for the select input
   */
  label?: string;
  /**
   * if true, the select input will be rendered as a button
   */
  isButton?: boolean;
  /**
   * onClick callback for the select input
   */
  onClick?: MouseEventHandler;
  /**
   * onChange callback for the select input
   * 
   * @param newValue 
   * @param actionMeta 
   * @returns 
   */
  onChange?: (newValue: OnChangeValue<unknown, boolean>, actionMeta: ActionMeta<unknown>) => void;
  /**
   * value for the select input
   */
  value?: any;
  /**
   * default options for the select input
   */
  defaultOptions?: any;
};

/**
 * DropdownSelect is a component that renders a dropdown select input.
 */
const DropdownSelect = ({
  label,
  isButton = false,
  onClick,
  onChange,
  value,
  defaultOptions,
}: DropdownSelectProps): JSX.Element => {
  const SelectComponent = (): JSX.Element => (
    <SelectInput
      className='dropdown-select'
      isDisabled={isButton}
      placeholder={'select...'}
      onChange={onChange}
      value={value}
      defaultOptions={defaultOptions}
    />
  );

  return (
    <SelectView label={label}>
      {isButton ? (
        <button className='select-input-button' onClick={onClick}>
          <SelectComponent />
        </button>
      ) : (
        <SelectComponent />
      )}
    </SelectView>
  );
};

export default DropdownSelect;
