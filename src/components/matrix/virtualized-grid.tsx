import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  MouseEventHandler,
} from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/hooks/matrix';

import GridCell from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-cell';
import RowHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-headers';
import ColumnHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-headers';

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
      rowLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollTop: offset });

      setSearchedRowIndex(index);
      setSearchedColIndex(null);
    },
    // Scrolls to and sets the searched index to the given one
    searchCol: (index: number) => {
      const offset = index * cellWidth - gridWidth / 2 - cellWidth / 2;
      columnLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollLeft: offset });

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
  const showRight = scrollX < cellWidth * numColumns - gridWidth;
  const showLeft = scrollX > 0;
  const showUp = scrollY > 0;
  const showDown = scrollY < cellHeight * numRows - gridHeight;

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
        width={gridWidth - 15}
        height={gridHeight - 15}
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

type GridMoveButton = {
  onClick: MouseEventHandler;
  rowHeaderWidth: number;
};

const GridLeftButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <button
      title='Scroll Left Button'
      className='grid-left-btn'
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 20,
        position: 'absolute',
        top: 12,
        left: rowHeaderWidth - 30,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        fill='#4674a7'
        className='bi bi-chevron-double-left'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d='M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        />
        <path
          fillRule='evenodd'
          d='M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        />
      </svg>
    </button>
  );
};

const GridUpButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        position: 'absolute',
        top: 25,
        width: rowHeaderWidth,
        paddingRight: 40,
      }}
    >
      <button
        title='Scroll Up Button'
        onClick={onClick}
        className='grid-up-btn'
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-up'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z'
          />
          <path
            fillRule='evenodd'
            d='M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z'
          />
        </svg>
      </button>
    </div>
  );
};

const GridRightButton = ({ onClick }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 45,
        position: 'absolute',
        top: 2,
        right: 0,
      }}
    >
      <button
        title='Scroll Right Button'
        onClick={onClick}
        className='grid-down-btn'
        style={{ backgroundColor: 'transparent' }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-right'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z'
          />
          <path
            fillRule='evenodd'
            d='M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z'
          />
        </svg>
      </button>
    </div>
  );
};

const GridDownButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: rowHeaderWidth,
        paddingRight: 40,
      }}
    >
      <button
        title='Scroll Down Button'
        className='grid-down-btn'
        onClick={onClick}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-down'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'
          />
          <path
            fillRule='evenodd'
            d='M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'
          />
        </svg>
      </button>
    </div>
  );
};

export default forwardRef(VirtualizedGrid);
