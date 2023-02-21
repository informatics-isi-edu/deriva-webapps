import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_search-bar.scss';

import { memo, CSSProperties, MouseEventHandler } from 'react';
import { StylesConfig } from 'react-select';
import { AsyncProps } from 'react-select/async';

import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

type SearchBarProps = {
  className?: string; // className of the container
  hideButton?: boolean; // hides the search button
  itemHeight: number; // the height of each menu item
  onPressButton?: MouseEventHandler; // onPress the search button
  selectProps: AsyncProps<any, any, any>; // props to be passed to the search/select input
};

/**
 * Optimized search bar component with menu list
 */
const SearchBar = ({
  onPressButton,
  className,
  selectProps,
  itemHeight,
  hideButton,
}: SearchBarProps): JSX.Element => {
  const controlStyles: CSSProperties = {
    height: 30,
    minHeight: 30,
    padding: '0px 10px',
  };

  if (!hideButton) {
    controlStyles['borderTopRightRadius'] = 0;
    controlStyles['borderBottomRightRadius'] = 0;
    controlStyles['borderRight'] = 0;
  }

  // Custom styles for Search Bar
  const selectStyles: StylesConfig = {
    control: (base) => ({
      ...base,
      ...controlStyles,
    }),
    input: (base) => ({
      ...base,
      input: {
        opacity: '1 !important',
      },
    }),
  };

  return (
    <div className={`${className} search-bar-container`}>
      <VirtualizedSelect
        className='search-input'
        itemHeight={itemHeight}
        styles={selectStyles}
        placeholder='Search...'
        controlShouldRenderValue={false}
        blurInputOnSelect={false}
        hideDropdownIndicator
        isSearchable
        {...selectProps}
      />
      {hideButton ? null : <MemoizedSearchBarButton onClick={onPressButton} />}
    </div>
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
    className='chaise-btn chaise-btn-primary search-bar-button'
    onClick={onClick}
    type='submit'
    role='search'
  >
    <span className='fa-solid fa-magnifying-glass' />
  </button>
);

const MemoizedSearchBarButton = memo(SearchBarButton);

export default memo(SearchBar);
