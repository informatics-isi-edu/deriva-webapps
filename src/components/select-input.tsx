import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_select.scss';

import { memo, MouseEventHandler } from 'react';
import { StylesConfig } from 'react-select';
import { AsyncProps } from 'react-select/async';
import { SelectComponents } from 'react-select/dist/declarations/src/components';

import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

export type SelectInputProps = {
  /**
   * onPress the search button
   */
  onPressButton?: MouseEventHandler;
} & AsyncProps<any, any, any>;

const ITEM_HEIGHT = 30;

// Define Custom Styles for the Select Component
export const SelectStyles: StylesConfig = {
  control: (base, { isDisabled }) => {
    const controlStyle = {
      ...base,
      ...{
        height: 30,
        minHeight: 30,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
      },
    };
    if (isDisabled) {
      controlStyle.backgroundColor = '#ddd';
      controlStyle.color = '#999';
    }
    return controlStyle;
  },
  singleValue: (base) => ({ ...base, padding: 0 }),
};

/**
 * Optimized search bar component with menu list
 */
const SelectInput = ({ className, onPressButton, ...rest }: SelectInputProps): JSX.Element => {
  const components: Partial<SelectComponents<unknown, any, any>> = {
    DropdownIndicator: rest.isDisabled
      ? () => null
      : () => <MemoizedDropdownButton onClick={onPressButton} />,
    IndicatorSeparator: () => null,
  };

  return (
    <VirtualizedSelect
      styles={SelectStyles}
      className={className}
      itemHeight={ITEM_HEIGHT}
      blurInputOnSelect={false}
      isSearchable={false}
      components={components}
      {...rest}
    />
  );
};

type DropdownButtonProps = {
  title?: string;
  onClick?: MouseEventHandler;
};

/**
 * The search bar button component
 */
const DropdownButton = ({ onClick }: DropdownButtonProps): JSX.Element => (
  <button
    aria-label='Select'
    className='chaise-btn chaise-btn-primary select-button'
    onClick={onClick}
    type='submit'
    role='button'
  >
    <span className='fa-solid fa-chevron-down' />
  </button>
);

const MemoizedDropdownButton = memo(DropdownButton);

export default SelectInput;
