import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_search-bar.scss';

import { memo, CSSProperties } from 'react';
import { StylesConfig } from 'react-select';
import { AsyncProps } from 'react-select/async';

import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

type SearchBarProps = {
  className?: string;
  hideButton?: boolean;
  itemHeight: number;
  hideDropdownIndicator?: boolean;
  onPressButton?: () => void;
  selectProps: AsyncProps<any, any, any>;
};

const controlStyles: CSSProperties = {
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  borderRight: 0,
  height: 30,
  minHeight: 30,
  padding: '0px 10px',
};

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

const SearchBar = (props: SearchBarProps): JSX.Element => {
  const { itemHeight, hideButton, onPressButton, className, selectProps } = props;

  const Button = (): JSX.Element => (
    <button
      className='chaise-search=>n chaise-btn chaise-btn-primary search-bar-button'
      onClick={onPressButton}
      type='submit'
      role='search'
    >
      <span className='chaise-=>-icon fa-solid fa-magnifying-glass' />
    </button>
  );

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
      {hideButton ? null : <Button />}
    </div>
  );
};

export default memo(SearchBar);
