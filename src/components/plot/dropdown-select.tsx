import { MouseEventHandler } from 'react';
import { ActionMeta, OnChangeValue } from 'react-select';

// components
import SelectView from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-view';
import SelectInput from '@isrd-isi-edu/deriva-webapps/src/components/select-input';

// models
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

/**
 * DropdownSelectProps is the type of props for DropdownSelect component.
 */
export type DropdownSelectProps = {
  /**
   * id for the select input
   */
  id?: string;
  /**
   * label for the select input
   */
  label?: string;
  /**
   * if true, the select input will be rendered as a button
   */
  isButton?: boolean;
  isDisabled?: boolean;
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
  value?: Option;
  /**
   * default options for the select input
   */
  defaultOptions?: any;
};

/**
 * DropdownSelect is a component that renders a dropdown select input.
 */
const DropdownSelect = ({
  id,
  label,
  isButton = false,
  isDisabled,
  onClick,
  onChange,
  value,
  defaultOptions,
}: DropdownSelectProps): JSX.Element => {
  

  const SelectComponent = ({id}: DropdownSelectProps): JSX.Element => (
    <SelectInput
      className='dropdown-select'
      id={id}
      isDisabled={isDisabled}
      placeholder={'select...'}
      onChange={onChange}
      value={value}
      defaultOptions={defaultOptions}
    />
  );

  return (
    <SelectView label={label}>
      {isButton && !isDisabled ? (
        <button className='select-input-button' onClick={onClick}>
          <SelectComponent />
        </button>
      ) : (
        <SelectComponent id={id}/>
      )}
    </SelectView>
  );
};

export default DropdownSelect;
