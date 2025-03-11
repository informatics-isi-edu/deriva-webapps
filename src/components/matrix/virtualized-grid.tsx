import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  type JSX,
} from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

import { ParsedGridCell, MatrixTreeDatum, TreeNode, TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

import GridCell from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-cell';
import RowTreeHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-tree-headers';
import RowHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-headers';
import ColumnTreeHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-tree-headers';
import ColumnHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-headers';
import {
  GridDownButton,
  GridLeftButton,
  GridRightButton,
  GridUpButton,
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-button';

import {
  addBottomHorizontalScroll,
  addRightVerticalScroll,
} from '@isrd-isi-edu/deriva-webapps/src/utils/ui-utils';

import { getScrollbarSize } from '@isrd-isi-edu/deriva-webapps/src/utils/ui-utils';

export type VirtualizedGridProps = {
  /**
   * height of the entire grid
   */
  gridHeight: number;
  /**
   * width of the entire grid
   */
  gridWidth: number;
  /**
   * height of each column header
   */
  columnHeaderHeight: number;
  /**
   * width of each row header
   */
  rowHeaderWidth: number;
  /**
   * whether allow scroll for row headers
   */
  rowHeaderScrollable: boolean;
  /**
   * whether allow scroll for column headers
   */
  colHeaderScrollable: boolean;
  /**
   * the max width of the scrollable content for row headers
   */
  rowHeaderScrollableMaxWidth: number;
  /**
   * the max width of the scrollable content for column headers
   */
  colHeaderScrollableMaxHeight: number;
  /**
   * width of each grid cell
   */
  cellWidth: number;
  /**
   * height of each grid cell
   */
  cellHeight: number;
  /**
   * parsed matrix data that the grid renders
   */
  data: Array<Array<ParsedGridCell>>;
  /**
   * hierarchical tree data that y axis renders
   */
  yTree?: Array<MatrixTreeDatum>;
  /**
   * hierarchical tree nodes that y axis renders
   */
  yTreeNodes?: TreeNode[];
  /**
   * hierarchical tree nodes dictionary that y axis renders
   */
  yTreeNodesMap?: TreeNodeMap;
  /**
   * hierarchical tree data that x axis renders
   */
  xTree?: Array<MatrixTreeDatum>;
  /**
   * hierarchical tree nodes that x axis renders
   */
  xTreeNodes?: TreeNode[];
  /**
   * hierarchical tree nodes dictionary that x axis renders
   */
  xTreeNodesMap?: TreeNodeMap;
  /**
   * max length of the titles in y-axis data
   */
  yDataMaxLength: number;
  /**
   * max length of the titles in x-axis data
   */
  xDataMaxLength: number;
  /**
   * color scale used for coloring the grid
   */
  colorScale: Array<string>;
};

/**
 * An optimized grid component that renders cells as they come into scroll from the grid.
 * Row and Column Headers are also virtualized as seperate scrollable lists and
 * synchronized based on their  scroll positions.
 */
const VirtualizedGrid = (
  {
    gridHeight,
    gridWidth,
    columnHeaderHeight,
    rowHeaderWidth,
    rowHeaderScrollable,
    colHeaderScrollable,
    rowHeaderScrollableMaxWidth,
    colHeaderScrollableMaxHeight,
    cellWidth,
    cellHeight,
    data,
    yTree,
    yTreeNodes,
    yTreeNodesMap,
    xTree,
    xTreeNodes,
    xTreeNodesMap,
    yDataMaxLength,
    xDataMaxLength,
    colorScale,
  }: VirtualizedGridProps,
  ref: any
): JSX.Element => {
  /** */
  const [scrollX, setScrollX] = useState<number>(0); // scroll x position
  const [scrollY, setScrollY] = useState<number>(0); // scroll y position

  // basic component
  const [hoveredRowID, setHoveredRowID] = useState<string | null>(null); // hovered row state for row headers
  const [hoveredColID, setHoveredColID] = useState<string | null>(null); // hovered col state for col headers
  const [searchedRowID, setSearchedRowID] = useState<string | null>(null); // searched row state for row headers
  const [searchedColID, setSearchedColID] = useState<string | null>(null); // searched col state for col headers
  const [numRows, setNumRows] = useState<number>(data.length);
  const [numColumns, setNumColumns] = useState<number>(data[0].length);

  // tree component
  const [visiableRowNodes, setVisiableRowNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
  const [visiableColNodes, setVisiableColNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in xTree and grid
  const [filteredGridYData, setFilteredGridYData] = useState<Array<Array<ParsedGridCell>> | null>(new Array<Array<ParsedGridCell>>()); // used for locating the Y searched entry
  const [filteredGridXData, setFilteredGridXData] = useState<Array<ParsedGridCell> | null>(new Array<ParsedGridCell>()); // used for locating the X searched entry
  const [filteredGridData, setFilteredGridData] = useState<ParsedGridCell[][] | null>(data);

  // track scrolling
  const [isScrolling, setIsScrolling] = useState(false); // State to track whether scrolling is happening
  const scrollTimeoutRef = useRef<number | null>(null); // Ref to track a timerId

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);
  const gridContainerRef = useRef<any>(null);


  /**
   * TODO
   *
   * Only for non-tree headers, for the condition that we expect its scrollable max width or height to be auto.
   * Current solution is that, the component width or height is calculated by font size and characters.
   * In the future, improve the solution or try other solutions.
   */
  // Calculate the max width for the row and column headers when it is scrollable and non-tree component
  const rowFontCharWidth = 7;
  const columnFontCharWidth = 8;
  let rowListWidth = rowHeaderScrollableMaxWidth === -1 ? yDataMaxLength * rowFontCharWidth : rowHeaderScrollableMaxWidth;
  // If the current row header is non-tree
  if (!yTree) {
    // Check whether the maxmium width of row labels is less than the fixed width, if it is, not to set it scrollable
    if (rowListWidth < rowHeaderWidth) {
      rowListWidth = rowHeaderWidth;
      rowHeaderScrollable = false;
    }
  }
  // Calculate the max height for the column headers when it is scrollable and non-tree component
  let columnListHeight = colHeaderScrollableMaxHeight === -1 ? xDataMaxLength * columnFontCharWidth : colHeaderScrollableMaxHeight;
  // If the current column header is non-tree
  if (!xTree) {
    // Check whether the maxmium height of column labels is less than the fixed height, if it is, not to set it scrollable
    if (columnListHeight < columnHeaderHeight) {
      columnListHeight = columnHeaderHeight;
      colHeaderScrollable = false;
    }
  }

  /**
   * Initialize the dummy scrollbar at the bottom of the row headers
   */
  useEffect(() => {
    if (rowHeaderScrollable && gridContainerRef.current) {
      const rowTreeViewAuto = !!yTree && rowHeaderScrollableMaxWidth === -1 && rowHeaderScrollable;
      addBottomHorizontalScroll(gridContainerRef.current, rowTreeViewAuto);
    }
  }, []);

  /**
   * Initialize the dummy scrollbar at the right of the column headers
   */
  useEffect(() => {
    if (colHeaderScrollable && gridContainerRef.current) {
      const colTreeViewAuto = !!xTree && colHeaderScrollableMaxHeight === -1 && colHeaderScrollable;
      addRightVerticalScroll(gridContainerRef.current, colTreeViewAuto);
    }
  }, []);

  /**
   * Filter the visiable rows and columns in GridData whenever visiableRowNodes or visiableColNodes changes
   * which means there are tree nodes expand or collapse
   */
  useEffect(() => {
    // If there is no tree data, then no need to filter visiable rows and columns because they all are visiable
    if (!xTree && !yTree) return;

    let newData: ParsedGridCell[][] = data;
    const lastRow: ParsedGridCell[] = data[data.length - 1]; // Store a copy of the last row

    // If the data of row header is in treeview, then for each row, filter the row.id to leave matching cells based on visiable row nodes
    if (yTree) {
      newData = newData.filter(gridRow =>
        gridRow.some(cell => visiableRowNodes?.has(cell.row.id))
      );
      // Since the filter operation remove the last row (empty row for margin) as well, there is a need to add it back
      newData.push(lastRow);
    }

    // If the data of column header is in treeview, then for each row, filter the column.id to leave matching cells based on visiable column nodes
    // Since each item in yData contains all xData/columns, so we need to firstly map each row, then filter each cell based on column id
    // Since the operation removes the empty column (for margin) at last of each row, need to add it back
    if (xTree) {
      newData = newData.map((gridRow) =>
        gridRow.filter((cell) => visiableColNodes?.has(cell.column.id))
          .concat(gridRow[gridRow.length - 1])
      );
    }

    setFilteredGridData(newData);
    setNumRows(newData.length);
    setNumColumns(newData[0].length);
  }, [visiableRowNodes, visiableColNodes, data]);

  /**
   * Update vertical tree and grid position to a specific entry
   * by listening the filteredGridYData changes, which means a new search happens
   * This is because a new search will change the expanded nodes which will effect
   * the data shown in both header component and grid
   */
  useEffect(() => {
    if (searchedRowID === null) return;

    let rowIndex;
    if (filteredGridYData !== null && filteredGridYData.length > 0) {
      rowIndex = filteredGridYData.findIndex((gridRow) => {
        return gridRow.some((cell) => cell.row.id === searchedRowID);
      });
    } else {
      rowIndex = data.findIndex((gridRow) => {
        return gridRow.some((cell) => cell.row.id === searchedRowID);
      });

    }
    // The first parenthesis used to calculate the searched row offset, and then the last two make it to be the center position
    const offset = (rowIndex * cellHeight) - (gridHeight / 2) - (cellHeight / 2);
    setScrollY(offset);
  }, [filteredGridYData, cellHeight, gridHeight, searchedRowID, data]);

  /**
   * Update horizontal tree and grid position to a specific entry
   * by listening the filteredGridXData changes, which means a new search happens
   */
  useEffect(() => {
    if (searchedColID === null) return;

    let colIndex;
    if (filteredGridXData !== null && filteredGridXData.length > 0) {
      colIndex = filteredGridXData.findIndex((cell) => cell.column.id === searchedColID);
    } else {
      colIndex = data[0].findIndex((cell) => cell.column.id === searchedColID);
    }
    // The first parenthesis used to calculate the searched column offset, and then the last two make it to be the center position
    const offset = (colIndex * cellWidth) - (gridWidth / 2) - (cellWidth / 2);
    setScrollX(offset);
  }, [cellWidth, filteredGridXData, gridWidth, searchedColID, data]);

  /**
   * Create a ref handle for this component
   */
  useImperativeHandle(ref, () => ({
    // Scrolls to and sets the searched index to the given one for row items
    searchRow: (index: string) => {
      setSearchedRowID(index);
      setSearchedColID(null);
    },
    // Scrolls to and sets the searched id to the given one for column items
    searchCol: (index: string) => {
      setSearchedRowID(null);
      setSearchedColID(index);
    },
    // Clears the searched indices
    clearSearch: () => {
      setSearchedRowID(null);
      setSearchedColID(null);
    },
  }));

  /**
   * Updates scroll position when grid is scrolled
   */
  const handleGridScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
  }, []);

  /**
   * Updates scroll position for Y tree when row is scrolled
   *
   * In order to improve performance, especially when scrolling the tree component,
   * the function to update row and column id is executed continuously,
   * which is experimentally proven to make the scroll behavior significantly delayed.
   * Referring to the flat component that will pause the execution of update operation when scrolling,
   * we set a debounce function to record whether there is a scroll operation currently,
   * if it is in progress, then stop the execution of update, otherwise, we can execute the update.
   */
  const handleTreeRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollTop to get the similar data
    setScrollY(rowLabelRef.current.scrollTop);
    // Set isScrolling to true
    setIsScrolling(true);
    // Clear previous timeout if it exists
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // Set a timeout to reset isScrolling after 300ms
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 300);
    // Use requestAnimationFrame to ensure smoother updates during scrolling
    window.requestAnimationFrame(() => {
      if (scrollTimeoutRef.current === null) {
        setIsScrolling(false);
      }
    });
  }, []);

  /**
   * Updates scroll position for X tree when column is scrolled
   *
   * Implement the same improvement as handleTreeRowLabelScroll
   */
  const handleTreeColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollLeft to get the similar data
    setScrollX(columnLabelRef.current.scrollLeft);
    // Set isScrolling to true
    setIsScrolling(true);
    // Clear previous timeout if it exists
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // Set a timeout to reset isScrolling after 300ms
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 300);
    // Use requestAnimationFrame to ensure smoother updates during scrolling
    window.requestAnimationFrame(() => {
      if (scrollTimeoutRef.current === null) {
        setIsScrolling(false);
      }
    });
  }, []);

  /**
   * Updates scroll position for flat Y component when row is scrolled
   */
  const handleRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollY(e.scrollOffset);
  }, []);

  /**
   * Updates scroll position for flat X component when column is scrolled
   */
  const handleColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollOffset);
  }, []);

  /**
   * Updates scroll by half page when scroll button is clicked
   */
  const pressScrollRight = () => {
    setScrollX((scrollX) => Math.min(scrollX + gridWidth / 2, cellWidth * numColumns));
  };
  const pressScrollLeft = () => {
    setScrollX((scrollX) => Math.max(scrollX - gridWidth / 2, 0));
  };
  const pressScrollDown = () => {
    setScrollY((scrollY) => Math.min(scrollY + gridHeight / 2, cellHeight * numRows));
  };
  const pressScrollUp = () => {
    setScrollY((scrollY) => Math.max(scrollY - gridHeight / 2, 0));
  };

  /**
   * Effect for updating scroll position of row, column and grid when it detects scroll changes
   * The tree components need one additional position parameters for another dimension
   */
  useEffect(() => {
    if (yTree) {
      rowLabelRef.current.scrollTo(0, scrollY);
    } else {
      rowLabelRef.current.scrollTo(scrollY);
    }

    if (xTree) {
      columnLabelRef.current.scrollTo(scrollX, 0);
    } else {
      columnLabelRef.current.scrollTo(scrollX);
    }

    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX, xTree, yTree]);

  // Data to be passed to Row, Column, and Grid Props
  const rowHeaderTreeData = useMemo(
    () => ({
      searchedRowID,
      hoveredRowID,
      setHoveredRowID,
      setHoveredColID,
      setVisiableRowNodes,
      setFilteredGridYData,
      isScrolling,
      listData: data,
    }),
    [searchedRowID, hoveredRowID, data, isScrolling]
  );
  const columnHeaderTreeData = useMemo(
    () => ({
      searchedColID,
      hoveredColID,
      setHoveredColID,
      setHoveredRowID,
      setVisiableColNodes,
      setFilteredGridXData,
      isScrolling,
      listData: data,
    }),
    [searchedColID, hoveredColID, data, isScrolling]
  );
  const gridData = useMemo(
    () => ({
      yTree,
      xTree,
      searchedColID,
      searchedRowID,
      hoveredRowID,
      hoveredColID,
      setHoveredRowID,
      setHoveredColID,
      gridData: filteredGridData,
      colorScale,
    }),
    [yTree, xTree, searchedColID, searchedRowID, hoveredRowID, hoveredColID, filteredGridData, colorScale]
  );

  const rowHeaderData = useMemo(
    () => ({
      hoveredRowID,
      searchedRowID,
      setHoveredRowID,
      setHoveredColID,
      listData: data,
    }),
    [hoveredRowID, searchedRowID, data]
  );

  const columnHeaderData = useMemo(
    () => ({
      hoveredColID,
      searchedColID,
      setHoveredRowID,
      setHoveredColID,
      listData: data,
    }),
    [hoveredColID, searchedColID, data]
  );

  const gridStyles: CSSProperties = {
    position: 'absolute',
    top: columnHeaderHeight,
    left: rowHeaderWidth,
  };

  const gridContainerStyles: CSSProperties = {
    position: 'relative',
    height: gridHeight + columnHeaderHeight,
    width: gridWidth + rowHeaderWidth,
  };

  const rowHeaderScrollBarContainer: CSSProperties = {
    width: rowHeaderWidth,
  }

  const columnHeaderScrollBarContainer: CSSProperties = {
    height: columnHeaderHeight,
  }

  // Move down 15px more to hide the horizontal scrollbar area
  const columnHeaderScrollBarWrapper: CSSProperties = {
    height: columnHeaderHeight + getScrollbarSize('.grid', true),
  }

  // Align the vertical scrollbar with the grid vertical scrollbar
  const columnHeaderScrollBar: CSSProperties = {
    width: 15,
  }

  /**
   * Giving a specific unique key to each grid cells to improve performance
   */
  const gridItemKey = ({ rowIndex, columnIndex, data: { gridData } }: any) => {
    return gridData[rowIndex][columnIndex].id;
  };

  // Boolean values to indicate whether scroll buttons are shown
  const showRight = scrollX < cellWidth * (numColumns - 1) - gridWidth;
  const showLeft = scrollX > 0;
  const showUp = scrollY > 0;
  const showDown = scrollY < cellHeight * (numRows - 1) - gridHeight;

  return (
    <div className='grid-container' style={gridContainerStyles} ref={gridContainerRef}>
      {/* Switch components to treeview one instead of flat one if yTree data exists */}
      {yTree ? (
        <RowTreeHeaders
          ref={rowLabelRef}
          cellHeight={cellHeight}
          cellWidth={cellWidth}
          width={rowHeaderWidth}
          scrollable={rowHeaderScrollable}
          scrollableMaxWidth={rowHeaderScrollableMaxWidth}
          top={columnHeaderHeight}
          height={gridHeight}
          itemCount={numRows}
          itemData={rowHeaderTreeData}
          treeData={yTree}
          treeNodes={yTreeNodes ?? []}
          treeNodesMap={yTreeNodesMap ?? {}}
          onScroll={handleTreeRowLabelScroll}
        />
      ) : (
        <RowHeaders
          ref={rowLabelRef}
          cellHeight={cellHeight}
          cellWidth={cellWidth}
          width={rowHeaderWidth}
          listWidth={rowListWidth}
          scrollable={rowHeaderScrollable}
          scrollableMaxWidth={rowHeaderScrollableMaxWidth}
          top={columnHeaderHeight}
          height={gridHeight}
          itemCount={numRows}
          itemData={rowHeaderData}
          onScroll={handleRowLabelScroll}
        />
      )}
      {/* Switch components to treeview one instead of flat one if xTree data exists */}
      {xTree ? (
        <ColumnTreeHeaders
          ref={columnLabelRef}
          height={columnHeaderHeight}
          cellWidth={cellWidth}
          left={rowHeaderWidth}
          width={gridWidth}
          scrollable={colHeaderScrollable}
          scrollableMaxHeight={colHeaderScrollableMaxHeight}
          itemCount={numColumns}
          itemData={columnHeaderTreeData}
          treeData={xTree}
          treeNodes={xTreeNodes ?? []}
          treeNodesMap={xTreeNodesMap ?? {}}
          onScroll={handleTreeColumnLabelScroll}
        />
      ) : (
        <ColumnHeaders
          ref={columnLabelRef}
          height={columnHeaderHeight}
          cellWidth={cellWidth}
          left={rowHeaderWidth}
          width={gridWidth}
          listHeight={columnListHeight}
          scrollable={colHeaderScrollable}
          scrollableMaxHeight={colHeaderScrollableMaxHeight}
          itemCount={numColumns}
          itemData={columnHeaderData}
          onScroll={handleColumnLabelScroll}
        />
      )}
      <Grid
        className='grid'
        style={gridStyles}
        width={gridWidth}
        height={gridHeight}
        columnWidth={cellWidth}
        rowHeight={cellHeight}
        rowCount={numRows}
        columnCount={numColumns}
        itemData={gridData}
        onScroll={handleGridScroll}
        ref={gridRef}
        overscanColumnCount={10}
        overscanRowCount={10}
        itemKey={gridItemKey}
      >
        {GridCell}
      </Grid>
      {/* Dummy scrollbar for the row headers */}
      {rowHeaderScrollable &&
        <div
          className='row-header-scrollbar-container'
          style={rowHeaderScrollBarContainer} >
          <div className='chaise-table-top-scroll-wrapper'>
            <div className='chaise-table-top-scroll'>
            </div>
          </div>
        </div>
      }
      {/* Dummy scrollbar for the column headers */}
      {colHeaderScrollable &&
        <div
          style={columnHeaderScrollBarContainer}
          className='column-header-scrollbar-container'
        >
          <div
            style={columnHeaderScrollBarWrapper}
            className='chaise-table-right-scroll-wrapper'
          >
            <div style={columnHeaderScrollBar} className='chaise-table-right-scroll'></div>
          </div>
        </div>
      }
      {showRight && <GridRightButton onClick={pressScrollRight} rowHeaderWidth={rowHeaderWidth} columnHeaderHeight={columnHeaderHeight} headerScrollable={colHeaderScrollable} />}
      {showUp && <GridUpButton onClick={pressScrollUp} rowHeaderWidth={rowHeaderWidth} columnHeaderHeight={columnHeaderHeight} />}
      {showLeft && <GridLeftButton onClick={pressScrollLeft} rowHeaderWidth={rowHeaderWidth} columnHeaderHeight={columnHeaderHeight} />}
      {showDown && <GridDownButton onClick={pressScrollDown} rowHeaderWidth={rowHeaderWidth} headerScrollable={rowHeaderScrollable} />}
    </div>
  );
};

export default forwardRef(VirtualizedGrid);
