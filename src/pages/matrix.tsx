import { createRoot } from 'react-dom/client';
import { useState, useRef } from 'react';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Legend from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';
import VirtualizedGrid from '@isrd-isi-edu/deriva-webapps/src/components/matrix/virtualized-grid';
import SearchBar from '@isrd-isi-edu/deriva-webapps/src/components/search-bar';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/hooks/window-size';
import { useMatrixData } from '@isrd-isi-edu/deriva-webapps/hooks/matrix';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';
import { InputActionMeta } from 'react-select';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const MatrixApp = (): JSX.Element => {
  const { width = 0, height = 0 } = useWindowSize();
  const { styles, matrixData, colorScaleMap, errors, colorBlindOption, setColorBlindOption } =
    useMatrixData(windowRef.matrixConfigs);
  const [input, setInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const gridRef = useRef<any>();

  // if there was an error during setup, hide the spinner
  if ((!matrixData || !colorScaleMap || !styles) && errors.length > 0) {
    return <></>;
  }

  if (!matrixData || !colorScaleMap || !styles) {
    return <ChaiseSpinner />;
  }

  const { gridDataMap, gridData, legendData, options } = matrixData;

  const handleChange = (option: any) => {
    if (option) {
      setInput(option.label);
      scrollToInput(option.label);
    } else {
      setInput('');
      gridRef.current.clearSearch();
    }
  };

  const handleInputChange = (value: string, action: InputActionMeta) => {
    if (action.action === 'input-change' || action.action === 'set-value') {
      setInput(value);
    }
  };

  const showNoResults = () => {
    setToastMessage('no result found');
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleChangeColor = () => setColorBlindOption((prev: boolean) => !prev);

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

  const handleSubmit = () => {
    scrollToInput(input);
  };

  // const handleKeyDown = (e: any) => {
  //   if (e.key === 'Enter') {
  //     scrollToInput(input);
  //   }
  // };

  const numRows = gridData.length;
  const numColumns = gridData[0].length;

  // layout values:
  const maxCols = styles.maxCols;
  const maxRows = styles.maxRows;

  const rowHeaderWidth = styles.rowHeaderWidth;
  const colHeaderHeight = styles.colHeaderHeight;
  const cellHeight = styles.cellHeight;
  const cellWidth = styles.cellWidth;

  const widthBufferSpace = 50;
  const heightBufferSpace = 350;
  const gridHeight = Math.min(
    cellHeight * numRows,
    height - colHeaderHeight - heightBufferSpace,
    colHeaderHeight + cellHeight * maxRows
  );
  const gridWidth = Math.min(
    cellWidth * numColumns,
    width - rowHeaderWidth - widthBufferSpace,
    rowHeaderWidth + cellWidth * maxCols
  );

  const legendWidth = gridWidth + rowHeaderWidth;
  const legendHeight = styles.legendHeight;
  const legendItemSize = styles.legendBarWidth;
  const searchItemHeight = 35;

  return (
    <div className='matrix-page'>
      {toastMessage ? (
        <div
          className='alert alert-danger'
          role='alert'
          style={{
            position: 'absolute',
            top: 167,
            left: width / 2 + 230,
            padding: '9px 12px',
          }}
        >
          {toastMessage}
        </div>
      ) : null}
      <div className='content-container'>
        <div className='title-container'>
          <h1>Mouse Data Summary</h1>
          <p>Click a cell or label to see the related datasets..</p>
        </div>
        <div className='options-container' style={{ width: legendWidth }}>
          <div className='dummy-option' />
          <SearchBar
            autoFocus
            className='search-bar'
            onInputChange={handleInputChange}
            onChange={handleChange}
            onPressButton={handleSubmit}
            // onKeyDown={handleKeyDown}
            itemHeight={searchItemHeight}
            options={options}
            inputValue={input}
            value={input ? { value: input, label: input } : undefined}
            isClearable={Boolean(input)}
            hideDropdownIndicator
            openMenuOnFocus={false}
            openMenuOnClick={false}
          />
          <div className='color-toggle-container'>
            <label htmlFor='color-blind-toggle' className='colorblind-label'>
              Colorblind Mode
            </label>
            <input
              id='color-blind-toggle'
              type='checkbox'
              checked={colorBlindOption}
              onChange={handleChangeColor}
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
            itemSize={legendItemSize}
            data={legendData}
            colorScale={colorScaleMap}
          />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
