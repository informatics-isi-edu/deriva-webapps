import { memo, CSSProperties } from 'react';
import { AsyncProps } from 'react-select/async';

import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_search-bar.scss';
import { StylesConfig } from 'react-select';

type SearchBarProps = AsyncProps<any, any, any> & {
  hideButton?: boolean;
  itemHeight: number;
  hideDropdownIndicator?: boolean;
  onPressButton?: () => void;
};

const controlStyles: CSSProperties = {
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  borderRight: 0,
  height: 30,
  minHeight: 30,
  padding: '0px 10px',
};

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
  const { hideButton, onPressButton, className, ...rest } = props;

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
        styles={selectStyles}
        placeholder='Search...'
        blurInputOnSelect={false}
        hideDropdownIndicator
        isSearchable
        controlShouldRenderValue={false}
        {...rest}
      />
      {hideButton ? null : <Button />}
    </div>
  );
};

export default memo(SearchBar);
