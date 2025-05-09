import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import { createRoot } from 'react-dom/client';
import { useState, useRef, CSSProperties, type JSX } from 'react';
import { InputActionMeta } from 'react-select';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Legend from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';
import VirtualizedGrid from '@isrd-isi-edu/deriva-webapps/src/components/matrix/virtualized-grid';
import SearchBar from '@isrd-isi-edu/deriva-webapps/src/components/search-input';
import VirtualizedSelect from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import DisplayValue from '@isrd-isi-edu/chaise/src/components/display-value';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useMatrixData } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import { processMatrixHeaderStyles } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
  openIframeLinksInTab: true,
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

  const gridRef = useRef<any>(undefined); // reference to the grid

  // if there was an error during setup, hide the spinner
  if ((!matrixData || !colorScaleMap || !config) && errors.length > 0) {
    return <></>;
  }

  if (!matrixData || !colorScaleMap || !config) {
    return <ChaiseSpinner />;
  }

  const { gridDataMap, gridData, legendData, options,
    yTreeData, yTreeNodes, yTreeNodesMap, xTreeData, xTreeNodes, xTreeNodesMap, yDataMaxLength, xDataMaxLength } = matrixData;

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
   * Edited for Treeview components
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
      gridRef.current.searchRow(selected.id);
    } else if (selected.type === 'col') {
      gridRef.current.searchCol(selected.id);
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
  const maxCols = styles?.max_displayed_columns;
  const maxRows = styles?.max_displayed_rows;

  const rowHeaderWidth = styles?.row_header?.width ? styles?.row_header?.width : 250;
  const colHeaderHeight = styles?.column_header?.height ? styles?.column_header?.height : 50;

  const {
    scrollable: rowHeaderScrollable,
    scrollableMaxSize: rowHeaderScrollableMaxWidth
  } = processMatrixHeaderStyles(rowHeaderWidth, styles?.row_header?.scrollable, styles?.row_header?.scrollable_max_width);

  const {
    scrollable: colHeaderScrollable,
    scrollableMaxSize: colHeaderScrollableMaxHeight
  } = processMatrixHeaderStyles(colHeaderHeight, styles?.column_header?.scrollable, styles?.column_header?.scrollable_max_height);

  const cellHeight = styles?.cell_height ? styles?.cell_height : 25;
  const cellWidth = styles?.cell_width ? styles?.cell_width : 25;

  const legendHeight = (styles?.legend?.height || styles?.legend?.height === 0) ? styles?.legend.height : 200;

  const title = config.title_markdown
    ? ConfigService.ERMrest.renderMarkdown(config.title_markdown)
    : '';
  const subtitle = config.subtitle_markdown
    ? ConfigService.ERMrest.renderMarkdown(config.subtitle_markdown)
    : '';

  const displayColorThemeContainer = matrixData.hasColor && colorOptions.length > 1;
  const displaySearchBar = !config.hide_search_box;

  const widthBufferSpace = 50; // buffer space for keeping everything in viewport

  // TODO is there anyway to make this dynamic?
  let heightBufferSpace = legendHeight;
  if (displayColorThemeContainer || displaySearchBar) heightBufferSpace += 30;
  if (title) heightBufferSpace += 50;
  if (subtitle) heightBufferSpace += 60;

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
  const legendBarWidth = styles?.legend?.bar_width ? styles?.legend?.bar_width : 55;
  const legendBarHeight = styles?.legend?.bar_height ? styles?.legend?.bar_height : 15;
  const legendLineClamp = styles?.legend?.line_clamp ? styles?.legend?.line_clamp : 1;
  const searchItemHeight = 30;

  /**
   * To make the legend container be the center when there are few z values, need to adjust its width dynamically.
   *
   * Variables:
   * legendData.length => number of z values (legend values)
   * legendBarWidth => width of each legend bar
   * legendHeight =>  height of the legend
   * (legendHeight - 25) => width of each div(split-text)
   * 0.707 => since we rotate the text 45˚, then when it is projected onto a horizontal line, needs to multiply cos45˚
   *
   * Two scenarios, comparison between width of div(split-text) and div(legend-links-container):
   * width of div(split-text) < div(legend-links-container) => div(legend-links-container) is offset to the right by half a legendBarWidth
   * width of div(split-text) > div(legend-links-container) => start with the middle of the last div(legend-bar-div), plus text projection distance
   */
  let fitLegendWidth = Math.max(
    (legendData.length + 0.5) * legendBarWidth,
    (legendData.length - 0.5) * legendBarWidth + 0.707 * (legendHeight - 25)
  );
  // if fitLegendWidth is more than the sum of (gridWidth + rowHeaderWidth), then it should go with the latter one
  fitLegendWidth = Math.min(legendWidth, fitLegendWidth);

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

  return (
    <div className='matrix-page'>
      <div className='content-container'>
        {(title || subtitle) &&
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
        }

        {(displaySearchBar || displayColorThemeContainer) &&
          <div className='options-container' style={{ width: legendWidth }}>
            {/* The dummy option can be added to center align the search-box */}
            {/* <div className='dummy-option' /> */}
            <div style={{ width: 350 }}>
              {displaySearchBar && <SearchBar
                className='search-bar'
                onPressButton={handleSubmit}
                itemHeight={searchItemHeight}
                {...searchBarSelectProps}
              />}
            </div>
            {displayColorThemeContainer &&
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
            }
          </div>
        }
        <div className='matrix-container'>
          <VirtualizedGrid
            ref={gridRef}
            gridHeight={gridHeight}
            gridWidth={gridWidth}
            rowHeaderWidth={rowHeaderWidth}
            columnHeaderHeight={colHeaderHeight}
            rowHeaderScrollable={rowHeaderScrollable}
            colHeaderScrollable={colHeaderScrollable}
            rowHeaderScrollableMaxWidth={rowHeaderScrollableMaxWidth}
            colHeaderScrollableMaxHeight={colHeaderScrollableMaxHeight}
            cellHeight={cellHeight}
            cellWidth={cellWidth}
            data={gridData}
            yTree={yTreeData}
            yTreeNodes={yTreeNodes}
            yTreeNodesMap={yTreeNodesMap}
            xTree={xTreeData}
            xTreeNodes={xTreeNodes}
            xTreeNodesMap={xTreeNodesMap}
            yDataMaxLength={yDataMaxLength}
            xDataMaxLength={xDataMaxLength}
            colorScale={colorScaleMap}
          />
          {legendHeight > 0 && legendData.length > 0 &&
            <Legend
              width={fitLegendWidth}
              height={legendHeight}
              barWidth={legendBarWidth}
              barHeight={legendBarHeight}
              lineClamp={legendLineClamp}
              data={legendData}
              colorScale={colorScaleMap}
            />
          }
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
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <MatrixApp />
  </AppWrapper>
);
