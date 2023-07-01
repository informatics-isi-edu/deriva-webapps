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
  
  import { ParsedGridCell, MatrixTreeDatum, TreeNode, TreeNodeMap} from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
  
  import GridTreeCell from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-tree-cell';
  import RowTreeHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-tree-headers';
  import ColumnHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-tree-headers';
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
     * color scale used for coloring the grid
     */
    colorScale: Array<string>; //
  };
  
  /**
   * An optimized grid component that renders cells as they come into scroll from the grid.
   * Row and Column Headers are also virtualized as seperate scrollable lists and
   * synchronized based on their  scroll positions.
   */
  const VirtualizedTreeGrid = (
    {
      gridHeight,
      gridWidth,
      columnHeaderHeight,
      rowHeaderWidth,
      cellWidth,
      cellHeight,
      data,
      yTree,
      yTreeNodes,
      yTreeNodesMap,
      colorScale,
    }: VirtualizedGridProps,
    ref: any
  ): JSX.Element => {
    /** */
    const [scrollX, setScrollX] = useState<number>(0); // scroll x position
    const [scrollY, setScrollY] = useState<number>(0); // scroll y position
    const [scrollTreeX, setScrollTreeX] = useState<number>(0); // scroll vertical treeview x position
    const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null); // hovered col state
    const [searchedRowIndex, setSearchedRowIndex] = useState<string | null>(null); // searched row state
    const [searchedColIndex, setSearchedColIndex] = useState<number | null>(null); // searched col state
    
    // tree
    const [hoveredRowID, setHoveredRowID] = useState<string | null>(null); // hovered row tree state
    const [hoveredColID, setHoveredColID] = useState<string | null>(null); // hovered col tree state
    const [searchedRowID, setSearchedRowID] = useState<string | null>(null); // searched row state
    const [visiableRowNodes, setVisiableRowNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
    const [filteredGridYData, setFilteredGridYData] = useState<Array<Array<ParsedGridCell>> | null>(new Array<Array<ParsedGridCell>>); // used for locating the searched entry
  
    const rowLabelRef = useRef<any>(null);
    const columnLabelRef = useRef<any>(null);
    const gridRef = useRef<any>(null);
  
    var numRows = data.length;
    const numColumns = data[0].length;
    const lastRow: ParsedGridCell[] = data[numRows-1]; // Store a copy of the last row

    // Used for update and sync the tree and grid when search happens
    var filteredGridData : ParsedGridCell[][] = data;
    if(visiableRowNodes){
      filteredGridData = data.filter((gridRow) => {
        return gridRow.some((cell) => visiableRowNodes.has(cell.row.id));
      });
    }
    filteredGridData.push(lastRow);
    if(filteredGridData){
      numRows = filteredGridData.length;
    }

    // Listen the filteredGridData changes, which means a new search happens
    useEffect(() => {
      if(filteredGridYData){
        const rowIndex = filteredGridYData.findIndex((gridRow) => {
          return gridRow.some((cell) => cell.row.id === searchedRowID);
        });
        const offset = rowIndex * cellHeight - gridHeight / 2 - cellHeight / 2;
        rowLabelRef?.current?.scrollTo(0, offset);
        gridRef?.current?.scrollTo({ scrollTop: offset });
      }
    }, [filteredGridYData]);

    // Create a ref handle for this component
    useImperativeHandle(ref, () => ({
      // Scrolls to and sets the searched index to the given one
      searchRow: (index: string) => {
        setSearchedRowID(index);
        setSearchedColIndex(null);
      },
      // Scrolls to and sets the searched index to the given one
      searchCol: (index: number) => {
        const offset = index * cellWidth - gridWidth / 2 - cellWidth / 2;
        columnLabelRef.current.scrollTo(offset);
        gridRef.current.scrollTo({ scrollLeft: offset });
        setScrollX(offset);
        setSearchedRowID(null);
        setSearchedColIndex(index);
      },
      // Clears the searched indices
      clearSearch: () => {
        setSearchedRowID(null);
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
      // The tree component does not have the event contains scrollOffset
      // So use ref to get the scrollTop to get the similar data
      setScrollTreeX(rowLabelRef.current.scrollLeft);
      setScrollY(rowLabelRef.current.scrollTop);
      // setScrollY(e.scrollOffset);
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
      rowLabelRef.current.scrollTo(scrollTreeX,scrollY);
      columnLabelRef.current.scrollTo(scrollX);
      gridRef.current.scrollTo({
        scrollLeft: scrollX,
        scrollTop: scrollY,
      });
    }, [scrollY, scrollX]);
  
    // Data to be passed to Row, Column, and Grid Props
    const rowHeaderData = useMemo(
      () => ({
        setHoveredColIndex,
        searchedRowID,
        hoveredRowID,
        setHoveredRowID,
        visiableRowNodes,
        setVisiableRowNodes,
        filteredGridYData,
        setFilteredGridYData,
        listData: data,
      }),
      [searchedRowID, hoveredRowID, data]
    );
    const columnHeaderData = useMemo(
      () => ({
        hoveredColIndex,
        setHoveredRowID,
        setHoveredColIndex,
        searchedColIndex,
        hoveredColID,
        setHoveredColID,
        listData: data,
      }),
      [hoveredColIndex, searchedColIndex, data]
    );
    const gridData = useMemo(
      () => ({
        hoveredColIndex,
        setHoveredColIndex,
        searchedColIndex,
        searchedRowID,
        hoveredRowID,
        hoveredColID,
        setHoveredRowID,
        setHoveredColID,
        visiableRowNodes,
        setVisiableRowNodes,
        gridData: filteredGridData,
        colorScale,
      }),
      [hoveredColIndex, searchedColIndex, searchedRowID, hoveredRowID, hoveredColID, filteredGridData, filteredGridData, colorScale]
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
        <RowTreeHeaders
          ref={rowLabelRef}
          cellHeight={cellHeight}
          cellWidth={cellWidth}
          width={rowHeaderWidth}
          top={columnHeaderHeight}
          height={gridHeight}
          itemCount={numRows}
          itemData={rowHeaderData}
          treeData={yTree}
          treeNodes={yTreeNodes}
          treeNodesMap={yTreeNodesMap}
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
          {GridTreeCell}
        </Grid>
        {showRight && <GridRightButton onClick={pressScrollRight} rowHeaderWidth={rowHeaderWidth} />}
        {showUp && <GridUpButton onClick={pressScrollUp} rowHeaderWidth={rowHeaderWidth} />}
        {showLeft && <GridLeftButton onClick={pressScrollLeft} rowHeaderWidth={rowHeaderWidth} />}
        {showDown && <GridDownButton onClick={pressScrollDown} rowHeaderWidth={rowHeaderWidth} />}
      </div>
    );
  };
  
  export default forwardRef(VirtualizedTreeGrid);
  