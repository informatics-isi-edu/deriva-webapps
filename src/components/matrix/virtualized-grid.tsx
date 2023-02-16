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
import { FixedSizeGrid } from 'react-window';

import GridCell from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-cell';
import RowHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-headers';
import ColumnHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-headers';

export type VirtualizedGridProps = {
  gridHeight: number;
  gridWidth: number;
  bufferWidth?: number;
  bufferHeight?: number;
  columnHeaderHeight: number;
  rowHeaderWidth: number;
  cellWidth: number;
  cellHeight: number;
  data: Array<Array<any>>;
  colorScale: Array<string>;
};

const VirtualizedGrid = (
  {
    gridHeight,
    gridWidth,
    bufferWidth = 0,
    bufferHeight = 0,
    columnHeaderHeight,
    rowHeaderWidth,
    cellWidth,
    cellHeight,
    data,
    colorScale,
  }: VirtualizedGridProps,
  ref: any
): JSX.Element => {
  const [scrollX, setScrollX] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);
  const [searchedRowIndex, setSearchedRowIndex] = useState<number | null>(null);
  const [searchedColIndex, setSearchedColIndex] = useState<number | null>(null);

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  const numRows = data.length;
  const numColumns = data[0].length;

  useImperativeHandle(ref, () => ({
    searchRow: (index: number) => {
      const offset = index * cellHeight - gridHeight / 2 - cellHeight / 2;
      rowLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollTop: offset });

      setSearchedRowIndex(index);
    },
    searchCol: (index: number) => {
      const offset = index * cellWidth - gridWidth / 2 - cellWidth / 2;
      columnLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollLeft: offset });

      setSearchedColIndex(index);
    },
    clearSearch: () => {
      setSearchedRowIndex(null);
      setSearchedColIndex(null);
    },
  }));

  const handleGridScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
  }, []);
  const handleRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollY(e.scrollOffset);
  }, []);
  const handleColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollOffset);
  }, []);

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

  useEffect(() => {
    rowLabelRef.current.scrollTo(scrollY);
    columnLabelRef.current.scrollTo(scrollX);
    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX]);

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
      colorScale: colorScale,
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
    height: gridHeight + columnHeaderHeight + bufferHeight,
    width: gridWidth + rowHeaderWidth + bufferWidth,
  };

  const gridItemKey = ({ rowIndex, columnIndex, data: { gridData } }: any) => {
    return gridData[rowIndex][columnIndex].id;
  };

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
        height={gridHeight + bufferHeight}
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
      <div className='grid-test'>
        <FixedSizeGrid
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
        </FixedSizeGrid>
      </div>
      {showRight && <GridRightButton onClick={pressScrollRight} rowHeaderWidth={rowHeaderWidth} />}
      {showUp && <GridUpButton onClick={pressScrollUp} rowHeaderWidth={rowHeaderWidth} />}
      {showLeft && <GridLeftButton onClick={pressScrollLeft} rowHeaderWidth={rowHeaderWidth} />}
      {showDown && <GridDownButton onClick={pressScrollDown} rowHeaderWidth={rowHeaderWidth} />}
    </div>
  );
};

const GridLeftButton = ({ onClick, rowHeaderWidth }: any): JSX.Element => {
  return (
    <button
      className='grid-left-btn'
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 30,
        position: 'absolute',
        top: 12,
        left: rowHeaderWidth - 30,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='30'
        height='30'
        fill='#4674a7'
        className='bi bi-arrow-bar-left'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d={
            'M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5ZM10 8a.5.5 0 0 1-.5.5H3.707l2.147' +
            ' 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5Z'
          }
        />
      </svg>
    </button>
  );
};

const GridUpButton = ({ onClick, rowHeaderWidth }: any): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className='grid-up-btn'
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        height: 30,
        width: rowHeaderWidth,
        position: 'absolute',
        top: 25,
        left: 0,
        paddingRight: 40,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='30'
        height='30'
        fill='#4674a7'
        className='bi bi-arrow-bar-up'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d={
            'M8 10a.5.5 0 0 0 .5-.5V3.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 ' +
            '0l-3 3a.5.5 0 1 0 .708.708L7.5 3.707V9.5a.5.5 0 0 0 .5.5zm-7 2.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5z'
          }
        />
      </svg>
    </button>
  );
};

const GridRightButton = ({ onClick, rowHeaderWidth }: any): JSX.Element => {
  return (
    <button
      onClick={onClick}
      className='grid-down-btn'
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 50,
        position: 'absolute',
        top: 0,
        right: 0,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='30'
        height='30'
        fill='#4674a7'
        className='bi bi-arrow-bar-right'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d={
            'M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 ' +
            '0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8Zm-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5Z'
          }
        />
      </svg>
    </button>
  );
};

const GridDownButton = ({ onClick, rowHeaderWidth }: any): JSX.Element => {
  return (
    <button
      className='grid-down-btn'
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        height: 30,
        width: rowHeaderWidth,
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingRight: 40,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='30'
        height='30'
        fill='#4674a7'
        className='bi bi-arrow-bar-down'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d={
            'M1 3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5zM8 6a.5.5 0 0 1 ' +
            '.5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 12.293V6.5A.5.5 0 0 1 8 6z'
          }
        />
      </svg>
    </button>
  );
};

export default forwardRef(VirtualizedGrid);
