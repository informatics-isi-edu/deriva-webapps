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
  const { matrixData, colorScaleMap, errors, colorBlindOption, setColorBlindOption } =
    useMatrixData(windowRef.matrixConfigs);
  const [input, setInput] = useState<string | undefined>();
  const gridRef = useRef<any>();

  // if there was an error during setup, hide the spinner
  if ((!matrixData || !colorScaleMap) && errors.length > 0) {
    return <></>;
  }

  if (!matrixData || !colorScaleMap) {
    return <ChaiseSpinner />;
  }

  const { gridDataMap, gridData, legendData, options } = matrixData;

  const handleChange = (option: any) => {
    if (option) {
      setInput(option.label);
    }
  };

  const handleInputChange = (value: string, action: InputActionMeta) => {
    if (action.action === 'input-change') {
      setInput(value);
    }
  };

  const handleChangeColor = () => setColorBlindOption((prev: boolean) => !prev);

  const scrollToInput = (currInput: string | undefined) => {
    if (!currInput || !gridDataMap[currInput.toLowerCase()]) {
      return;
    }
    const selected = gridDataMap[currInput.toLowerCase()];
    if (selected.type === 'row') {
      gridRef.current.scrollToRow(selected.index);
    } else if (selected.type === 'col') {
      gridRef.current.scrollToCol(selected.index);
    }
  };

  const handleSubmit = () => {
    scrollToInput(input);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      scrollToInput(input);
    }
  };

  const numRows = gridData.length;
  const numColumns = gridData[0].length;

  // layout values:
  const minHorizontalCells = 30;
  const minVerticalCells = 20;
  const rowHeaderWidth = 300;
  const columnHeaderHeight = 50;
  const bufferWidth = 25;
  const cellHeight = 25;
  const cellWidth = 25;
  const widthBufferSpace = 50;
  const heightBufferSpace = 450;
  const gridHeight = Math.min(
    cellHeight * numRows,
    height - columnHeaderHeight - heightBufferSpace
    // columnHeaderHeight + cellHeight * minVerticalCells
  );
  const gridWidth = Math.min(
    cellWidth * numColumns,
    width - rowHeaderWidth - widthBufferSpace,
    rowHeaderWidth + cellWidth * minHorizontalCells
  );
  const legendWidth = gridWidth + rowHeaderWidth;
  const legendHeight = 170;
  const legendItemSize = 55;
  const searchItemHeight = 35;

  return (
    <div className='matrix-page'>
      <div className='content-container'>
        <div className='title-container'>
          <h1>Mouse Data Summary</h1>
          <p>Click a cell or label to see the related datasets..</p>
        </div>
        <div className='options-container' style={{ width: legendWidth }}>
          <div style={{ width: 100 }} />
          <SearchBar
            autoFocus
            className='search-bar'
            onInputChange={handleInputChange}
            onChange={handleChange}
            onPressButton={handleSubmit}
            onKeyDown={handleKeyDown}
            itemHeight={searchItemHeight}
            options={options}
            inputValue={input}
            hideDropdownIndicator
            openMenuOnFocus={false}
            openMenuOnClick={false}
            isClearable
          />
          <div className='color-toggle-container'>
            <label htmlFor='color-blind-toggle'>Colorblind Option</label>
            <label className='switch'>
              {/* https://www.w3schools.com/howto/howto_css_switch.asp */}
              <input
                id='color-blind-toggle'
                type='checkbox'
                checked={colorBlindOption}
                onChange={handleChangeColor}
              />
              <span className='slider round' />
            </label>
          </div>
        </div>
        <div className='matrix-container'>
          <VirtualizedGrid
            ref={gridRef}
            gridHeight={gridHeight}
            gridWidth={gridWidth}
            bufferWidth={bufferWidth}
            rowHeaderWidth={rowHeaderWidth}
            columnHeaderHeight={columnHeaderHeight}
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
