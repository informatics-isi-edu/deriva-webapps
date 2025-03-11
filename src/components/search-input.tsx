import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_select.scss';

import { memo, MouseEventHandler, type JSX } from 'react';
import { StylesConfig } from 'react-select';
import { AsyncProps } from 'react-select/async';

import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { SelectComponents } from 'react-select/dist/declarations/src/components';

export type SearchInputProps = {
  /**
   * className of the container
   */
  className?: string;
  /**
   * hides the search button
   */
  hideButton?: boolean;
  /**
   * the height of each menu item
   */
  itemHeight: number;
  /**
   * onPress the search button
   */
  onPressButton?: MouseEventHandler;
} & AsyncProps<any, any, any>;

/**
 * Optimized search bar component with menu list
 */
const SearchInput = ({
  onPressButton,
  className,
  itemHeight,
  hideButton,
  ...selectProps
}: SearchInputProps): JSX.Element => {
  // Custom styles for Search Bar
  const selectStyles: StylesConfig = {
    input: (base) => ({
      ...base,
      input: {
        opacity: '1 !important',
      },
    }),
  };

  const components: Partial<SelectComponents<unknown, any, any>> = {
    DropdownIndicator: () => <MemoizedSearchBarButton onClick={onPressButton} />,
    IndicatorSeparator: () => null,
  };

  if (hideButton) {
    components['DropdownIndicator'] = () => null;
  }

  let selectClassName = 'select-input';
  if (className) {
    selectClassName += ` ${className}`;
  }

  /**
   * Function to filter based on searched options
   */
  const loadOptions = (input: string, callback: any) => {
    setTimeout(() => {
      callback(
        selectProps?.options?.filter(({ label }: any) =>
          label.toLowerCase().includes(input.toLowerCase())
        )
      );
    }, 200);
  };

  return (
    <VirtualizedSelect
      className={selectClassName}
      itemHeight={itemHeight}
      styles={selectStyles}
      placeholder='Search...'
      controlShouldRenderValue={false}
      blurInputOnSelect={false}
      hideDropdownIndicator
      isSearchable
      components={components}
      loadOptions={loadOptions}
      {...selectProps}
    />
  );
};

type SearchBarButtonProps = {
  onClick?: MouseEventHandler;
};

/**
 * The search bar button component
 */
const SearchBarButton = ({ onClick }: SearchBarButtonProps): JSX.Element => (
  <button
    aria-label='Search'
    className='chaise-btn chaise-btn-primary select-button'
    onClick={onClick}
    type='submit'
    role='search'
  >
    <span className='fa-solid fa-magnifying-glass' />
  </button>
);

const MemoizedSearchBarButton = memo(SearchBarButton);

export default SearchInput;
