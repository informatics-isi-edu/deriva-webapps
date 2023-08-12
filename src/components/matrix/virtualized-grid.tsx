import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
} from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

import GridCell from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-cell';
import RowHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-headers';
import ColumnHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-headers';
import {
  GridDownButton,
  GridLeftButton,
  GridRightButton,
  GridUpButton,
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-button';

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
   * color scale used for coloring the grid
   */
  colorScale: Array<string>; //
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
    cellWidth,
    cellHeight,
    data,
    colorScale,
  }: VirtualizedGridProps,
  ref: any
): JSX.Element => {
  /** */
  const [scrollX, setScrollX] = useState<number>(0); // scroll x position
  const [scrollY, setScrollY] = useState<number>(0); // scroll y position
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null); // hovered row state
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null); // hovered col state
  const [searchedRowIndex, setSearchedRowIndex] = useState<number | null>(null); // searched row state
  const [searchedColIndex, setSearchedColIndex] = useState<number | null>(null); // searched col state

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  const numRows = data.length;
  const numColumns = data[0].length;

  // Create a ref handle for this component
  useImperativeHandle(ref, () => ({
    // Scrolls to and sets the searched index to the given one
    searchRow: (index: number) => {
      const offset = index * cellHeight - gridHeight / 2 - cellHeight / 2;
      rowLabelRef?.current?.scrollTo(offset);
      gridRef?.current?.scrollTo({ scrollTop: offset });
      setScrollY(offset);
      setSearchedRowIndex(index);
      setSearchedColIndex(null);
    },
    // Scrolls to and sets the searched index to the given one
    searchCol: (index: number) => {
      const offset = index * cellWidth - gridWidth / 2 - cellWidth / 2;
      columnLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollLeft: offset });
      setScrollX(offset);
      setSearchedRowIndex(null);
      setSearchedColIndex(index);
    },
    // Clears the searched indices
    clearSearch: () => {
      setSearchedRowIndex(null);
      setSearchedColIndex(null);
    },
  }));

  // Updates scroll position when grid is scrolled
  const handleGridScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
  }, []);
  // Updates scroll position when row is scrolled
  const handleRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollY(e.scrollOffset);
  }, []);
  // Updates scroll position when column is scrolled
  const handleColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollOffset);
  }, []);

  // Updates scroll by half page when scroll button is clicked
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

  // Effect for updating scroll position of row, column and grid when it detects scroll changes
  useEffect(() => {
    rowLabelRef.current.scrollTo(scrollY);
    columnLabelRef.current.scrollTo(scrollX);
    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX]);

  // Data to be passed to Row, Column, and Grid Props
  const rowHeaderData = useMemo(
    () => ({
      hoveredRowIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      searchedRowIndex,
      listData: data,
    }),
    [hoveredRowIndex, searchedRowIndex, data]
  );
  const columnHeaderData = useMemo(
    () => ({
      hoveredColIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      searchedColIndex,
      listData: data,
    }),
    [hoveredColIndex, searchedColIndex, data]
  );
  const gridData = useMemo(
    () => ({
      hoveredRowIndex,
      hoveredColIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      searchedColIndex,
      searchedRowIndex,
      gridData: data,
      colorScale,
    }),
    [hoveredRowIndex, hoveredColIndex, searchedColIndex, searchedRowIndex, data, colorScale]
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

  // Giving a specific unique key to each grid cells to improve performance
  const gridItemKey = ({ rowIndex, columnIndex, data: { gridData } }: any) => {
    return gridData[rowIndex][columnIndex].id;
  };

  // Boolean values to indicate whether scroll buttons are shown
  const showRight = scrollX < cellWidth * (numColumns - 1) - gridWidth;
  const showLeft = scrollX > 0;
  const showUp = scrollY > 0;
  const showDown = scrollY < cellHeight * (numRows - 1) - gridHeight;

  return (
    <div className='grid-container' style={gridContainerStyles}>
      <RowHeaders
        ref={rowLabelRef}
        cellHeight={cellHeight}
        cellWidth={cellWidth}
        width={rowHeaderWidth}
        top={columnHeaderHeight}
        height={gridHeight}
        itemCount={numRows}
        itemData={rowHeaderData}
        onScroll={handleRowLabelScroll}
      />
      <ColumnHeaders
        ref={columnLabelRef}
        height={columnHeaderHeight}
        cellWidth={cellWidth}
        left={rowHeaderWidth}
        width={gridWidth}
        itemCount={numColumns}
        itemData={columnHeaderData}
        onScroll={handleColumnLabelScroll}
      />
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
      {showRight && <GridRightButton onClick={pressScrollRight} rowHeaderWidth={rowHeaderWidth} />}
      {showUp && <GridUpButton onClick={pressScrollUp} rowHeaderWidth={rowHeaderWidth} />}
      {showLeft && <GridLeftButton onClick={pressScrollLeft} rowHeaderWidth={rowHeaderWidth} />}
      {showDown && <GridDownButton onClick={pressScrollDown} rowHeaderWidth={rowHeaderWidth} />}
    </div>
  );
};

export default forwardRef(VirtualizedGrid);
