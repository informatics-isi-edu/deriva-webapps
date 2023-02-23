import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import { createRoot } from 'react-dom/client';
import { useState, useRef, CSSProperties } from 'react';
import { InputActionMeta } from 'react-select';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Legend from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';
import VirtualizedGrid from '@isrd-isi-edu/deriva-webapps/src/components/matrix/virtualized-grid';
import SearchBar from '@isrd-isi-edu/deriva-webapps/src/components/search-bar';
import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import DisplayValue from '@isrd-isi-edu/chaise/src/components/display-value';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/hooks/window-size';
import { useMatrixData } from '@isrd-isi-edu/deriva-webapps/hooks/matrix';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const MatrixApp = (): JSX.Element => {
  const { width = 0, height = 0 } = useWindowSize();
  const {
    errors,
    config,
    matrixData,
    colorScaleMap,
    colorThemeOption,
    setColorThemeOption,
    colorOptions,
  } = useMatrixData(windowRef.matrixConfigs); // get the data needed to render the grid
  /**
   * search input text state
   */
  const [input, setInput] = useState<string>('');
  /**
   * toast message state
   */
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const gridRef = useRef<any>(); // reference to the grid

  // if there was an error during setup, hide the spinner
  if ((!matrixData || !colorScaleMap || !config) && errors.length > 0) {
    return <></>;
  }

  if (!matrixData || !colorScaleMap || !config) {
    return <ChaiseSpinner />;
  }

  const { gridDataMap, gridData, legendData, options } = matrixData;

  /**
   * Handles changes to the search bar
   *
   * @param option
   */
  const handleChange = (option: any) => {
    if (option) {
      setInput(option.label);
      scrollToInput(option.label);
    } else {
      setInput('');
      gridRef.current.clearSearch();
    }
  };

  /**
   * Handles input changes to the search bar
   *
   * @param value
   * @param action
   */
  const handleInputChange = (value: string, action: InputActionMeta) => {
    if (action.action === 'input-change' || action.action === 'set-value') {
      setInput(value);
    }
  };

  /**
   * Sets a state to show message when no results found from search
   */
  const showNoResults = () => {
    setToastMessage('no search result found');
    setTimeout(() => setToastMessage(''), 2000);
  };

  /**
   * Scrolls the grid to the given input string if found in the matrix,
   * otherwise shows a no results message
   *
   * @param currInput
   * @returns
   */
  const scrollToInput = (currInput: string | undefined) => {
    if (!currInput) {
      return;
    }
    if (!gridDataMap[currInput.toLowerCase()]) {
      showNoResults();
      return;
    }

    const selected = gridDataMap[currInput.toLowerCase()];
    if (selected.type === 'row') {
      gridRef.current.searchRow(selected.index);
    } else if (selected.type === 'col') {
      gridRef.current.searchCol(selected.index);
    }
  };

  /**
   * Handles when the user clicks the search button
   */
  const handleSubmit = () => {
    scrollToInput(input);
  };

  /**
   * Handls changes to the Color theme dropdown
   *
   * @param option
   */
  const handleChangeTheme = (option: any) => {
    if (option) {
      setColorThemeOption(option);
    }
  };

  const numRows = gridData.length;
  const numColumns = gridData[0].length;

  // Calculate Layout of the Grid:
  const { styles } = config;
  const maxCols = styles?.maxCols;
  const maxRows = styles?.maxRows;

  const rowHeaderWidth = styles?.rowHeaderWidth ? styles?.rowHeaderWidth : 300;
  const colHeaderHeight = styles?.colHeaderHeight ? styles?.colHeaderHeight : 50;
  const cellHeight = styles?.cellHeight ? styles?.cellHeight : 25;
  const cellWidth = styles?.cellWidth ? styles?.cellWidth : 25;

  const legendHeight = styles?.legendHeight ? styles?.legendHeight : 170;

  const widthBufferSpace = 50; // buffer space for keeping everything in viewport
  const heightBufferSpace = legendHeight * 2; // buffer space for keeping everything in viewport

  const strictMinHeight = 200;
  const strictMinWidth = 400;

  let gridHeight = Math.min(
    cellHeight * numRows, // can't exceed total grid
    height - colHeaderHeight - heightBufferSpace // can't exceed browser height
  );
  if (maxRows) {
    // restrict by maxRows if exists
    gridHeight = Math.min(gridHeight, colHeaderHeight + cellHeight * maxRows);
  }
  gridHeight = Math.max(gridHeight, strictMinHeight);

  let gridWidth = Math.min(
    cellWidth * numColumns, // can't exceed total grid
    width - rowHeaderWidth - widthBufferSpace // can't exceed browser width
  );
  if (maxCols) {
    // restrict by maxRows if exists
    gridWidth = Math.min(gridWidth, rowHeaderWidth + cellWidth * maxCols);
  }
  gridWidth = Math.max(gridWidth, strictMinWidth);

  const legendWidth = gridWidth + rowHeaderWidth;
  const legendBarWidth = styles?.legendBarWidth ? styles?.legendBarWidth : 55;
  const legendBarHeight = styles?.legendBarHeight ? styles?.legendBarHeight : 15;
  const searchItemHeight = 30;

  const toastStyles: CSSProperties = {
    position: 'absolute',
    top: height / 2 - 300,
    left: width / 2 - 100,
    padding: '9px 12px',
  };

  const searchBarSelectProps = {
    autoFocus: true,
    onInputChange: handleInputChange,
    onChange: handleChange,
    options,
    inputValue: input,
    value: input ? { value: input, label: input } : undefined,
    isClearable: Boolean(input),
    openMenuOnFocus: false,
    openMenuOnClick: false,
  };

  const title = config.title_markdown
    ? ConfigService.ERMrest.renderMarkdown(config.title_markdown)
    : '';
  const subtitle = config.subtitle_markdown
    ? ConfigService.ERMrest.renderMarkdown(config.subtitle_markdown)
    : '';

  return (
    <div className='matrix-page'>
      <div className='content-container'>
        {config.title_markdown && config.title_markdown ? (
          <div className='title-container'>
            {title && (
              <h1>
                <DisplayValue addClass value={{ value: title, isHTML: true }} />
              </h1>
            )}
            {subtitle && (
              <div className='matrix-subtitle'>
                <DisplayValue addClass value={{ value: subtitle, isHTML: true }} />
              </div>
            )}
          </div>
        ) : null}

        <div className='options-container' style={{ width: legendWidth }}>
          <div className='dummy-option' />
          <SearchBar
            className='search-bar'
            selectProps={searchBarSelectProps}
            onPressButton={handleSubmit}
            itemHeight={searchItemHeight}
          />
          <div className='color-theme-container'>
            <label className='color-theme-label'>Color Theme</label>
            <VirtualizedSelect
              className='color-theme-select'
              value={colorThemeOption}
              onChange={handleChangeTheme}
              options={colorOptions}
              defaultOptions={colorOptions}
              itemHeight={30}
              isSearchable={false}
            />
          </div>
        </div>
        <div className='matrix-container'>
          <VirtualizedGrid
            ref={gridRef}
            gridHeight={gridHeight}
            gridWidth={gridWidth}
            rowHeaderWidth={rowHeaderWidth}
            columnHeaderHeight={colHeaderHeight}
            cellHeight={cellHeight}
            cellWidth={cellWidth}
            data={gridData}
            colorScale={colorScaleMap}
          />
          <Legend
            width={legendWidth}
            height={legendHeight}
            barWidth={legendBarWidth}
            barHeight={legendBarHeight}
            data={legendData}
            colorScale={colorScaleMap}
          />
        </div>
      </div>
      {toastMessage ? (
        <div className='alert alert-danger' role='alert' style={toastStyles}>
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
