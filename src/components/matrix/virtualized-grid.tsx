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

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  const numRows = data.length;
  const numColumns = data[0].length;

  useImperativeHandle(ref, () => ({
    scrollToRow: (index: number) => {
      const offset = index * cellHeight - gridHeight / 2;
      rowLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollTop: offset });

      setHoveredRowIndex(index);
    },
    scrollToCol(index: number) {
      const offset = index * cellWidth - gridWidth / 2;
      columnLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollLeft: offset });

      setHoveredColIndex(index);
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
      listData: data,
    }),
    [hoveredRowIndex, data]
  );
  const columnHeaderData = useMemo(
    () => ({
      hoveredColIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      listData: data,
    }),
    [hoveredColIndex, data]
  );
  const gridData = useMemo(
    () => ({
      hoveredRowIndex,
      hoveredColIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      gridData: data,
      colorScale: colorScale,
    }),
    [hoveredRowIndex, hoveredColIndex, data, colorScale]
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
        bufferWidth={bufferWidth}
        itemCount={numColumns}
        itemData={columnHeaderData}
        onScroll={handleColumnLabelScroll}
      />
      <div className='grid-test'>
        <FixedSizeGrid
          className='grid'
          style={gridStyles}
          columnWidth={cellWidth}
          height={gridHeight}
          width={gridWidth}
          rowCount={numRows}
          columnCount={numColumns}
          itemData={gridData}
          rowHeight={cellHeight}
          onScroll={handleGridScroll}
          ref={gridRef}
          overscanColumnCount={3}
          overscanRowCount={3}
          itemKey={gridItemKey}
        >
          {GridCell}
        </FixedSizeGrid>
      </div>
    </div>
  );
};

export default forwardRef(VirtualizedGrid);
