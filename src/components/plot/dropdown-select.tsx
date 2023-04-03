import { MouseEventHandler } from 'react';
import { ActionMeta, OnChangeValue } from 'react-select';

import SelectView from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-view';
import SelectInput from '@isrd-isi-edu/deriva-webapps/src/components/select-input';

export type DropdownSelectProps = {
  label?: string;
  isButton?: boolean;
  onClick?: MouseEventHandler;
  onChange?: (newValue: OnChangeValue<unknown, boolean>, actionMeta: ActionMeta<unknown>) => void;
  value?: any;
  defaultOptions?: any;
};

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
