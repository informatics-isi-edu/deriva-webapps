import { useState, useRef, useEffect, useCallback, useMemo, CSSProperties } from 'react';
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
};

const VirtualizedGrid = ({
  gridHeight,
  gridWidth,
  bufferWidth = 0,
  bufferHeight = 0,
  columnHeaderHeight,
  rowHeaderWidth,
  cellWidth,
  cellHeight,
  data,
}: VirtualizedGridProps): JSX.Element => {
  const [scrollX, setScrollX] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  const handleGridScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
    setHoveredColIndex(null);
    setHoveredRowIndex(null);
  }, []);
  const handleRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollY(e.scrollOffset);
    setHoveredColIndex(null);
    setHoveredRowIndex(null);
  }, []);
  const handleColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollOffset);
    setHoveredColIndex(null);
    setHoveredRowIndex(null);
  }, []);

  useEffect(() => {
    rowLabelRef.current.scrollTo(scrollY);
    columnLabelRef.current.scrollTo(scrollX);
    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX]);

  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hoveredColIndex, setHoveredColIndex] = useState(null);

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
    }),
    [hoveredRowIndex, hoveredColIndex, data]
  );

  const gridStyles: CSSProperties = {
    position: 'absolute',
    top: columnHeaderHeight,
    left: rowHeaderWidth,
  };

  const numRows = data.length;
  const numColumns = data[0].length;

  const gridContainerStyles: CSSProperties = {
    position: 'relative',
    height: gridHeight + columnHeaderHeight + bufferHeight,
    width: gridWidth + rowHeaderWidth + bufferWidth,
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
        width={gridWidth + bufferWidth}
        itemCount={numColumns}
        itemData={columnHeaderData}
        onScroll={handleColumnLabelScroll}
      />
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
      >
        {GridCell}
      </FixedSizeGrid>
    </div>
  );
};

export default VirtualizedGrid;
