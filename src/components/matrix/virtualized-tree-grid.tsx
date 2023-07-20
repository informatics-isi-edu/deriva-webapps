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
import RowHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-headers';
import ColumnTreeHeaders from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-tree-headers';
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
    xTree,
    xTreeNodes,
    xTreeNodesMap,
    colorScale,
  }: VirtualizedGridProps,
  ref: any
): JSX.Element => {
  /** */
  const [scrollX, setScrollX] = useState<number>(0); // scroll x position
  const [scrollY, setScrollY] = useState<number>(0); // scroll y position
  const [scrollTreeX, setScrollTreeX] = useState<number>(0); // scroll vertical treeview x position
  const [scrollTreeY, setScrollTreeY] = useState<number>(0); // scroll horizontal treeview y position
  
  // basic component
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null); // hovered row state
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null); // hovered col state
  const [searchedRowIndex, setSearchedRowIndex] = useState<number | null>(null); // searched row state
  const [searchedColIndex, setSearchedColIndex] = useState<number | null>(null); // searched col state
  
  // tree component
  const [hoveredRowID, setHoveredRowID] = useState<string | null>(null); // hovered row tree state
  const [hoveredColID, setHoveredColID] = useState<string | null>(null); // hovered col tree state
  const [searchedRowID, setSearchedRowID] = useState<string | null>(null); // searched row tree state
  const [searchedColID, setSearchedColID] = useState<string | null>(null); // searched col tree state
  const [visiableRowNodes, setVisiableRowNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
  const [visiableColNodes, setVisiableColNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
  const [filteredGridYData, setFilteredGridYData] = useState<Array<Array<ParsedGridCell>> | null>(new Array<Array<ParsedGridCell>>); // used for locating the searched entry
  const [filteredGridXData, setFilteredGridXData] = useState<Array<ParsedGridCell> | null>(new Array<ParsedGridCell>); // used for locating the searched entry
  const [scrollTreeYIniPos, setScrollTreeYIniPos] = useState<number>(0); // scroll horizontal treeview y position

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  var numRows = data.length;
  var numColumns = data[0].length;
  const lastRow: ParsedGridCell[] = data[numRows-1]; // Store a copy of the last row

  /**
   * Calculate the y position of the horizontal tree view
   */
  // Get max layer and title to help estimate the position
  function getMaxLayersAndTitleLength(treeNodes: TreeNode[]) {
    let maxLayers = 0;
    let maxTitleLength = 0;
  
    const traverseTree = (node: TreeNode, depth: number) => {
      maxLayers = Math.max(maxLayers, depth);
      maxTitleLength = Math.max(maxTitleLength, node.title.length);
  
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          traverseTree(child, depth + 1);
        });
      }
    };
  
    treeNodes.forEach((node) => {
      traverseTree(node, 1);
    });
  
    return { maxLayers, maxTitleLength };
  }

  // Initialize the vertical position of the horizontal tree
  useEffect(() => {
    if (xTreeNodes) {
      const { maxLayers, maxTitleLength } = getMaxLayersAndTitleLength(xTreeNodes);
      // Font size is 14px in this page
      const yPositionXTree = maxLayers * maxTitleLength * 14;
      setScrollTreeYIniPos(yPositionXTree);
      setScrollTreeY(yPositionXTree);
    }
  }, [xTreeNodes]);


  // Used for update and sync the tree and grid when search happens
  var filteredGridData : ParsedGridCell[][] = data;
  
  if(xTree || yTree){
    if(xTree && yTree){
      filteredGridData = data
      .filter((gridRow) =>
        gridRow.some((cell) => visiableRowNodes?.has(cell.row.id))
      )
      .map((gridRow) =>
        gridRow.filter((cell) => visiableColNodes?.has(cell.column.id))
        .concat(gridRow[gridRow.length - 1])
      );
      filteredGridData.push(lastRow);
    }else if(!xTree && yTree){
      filteredGridData = data
      .filter((gridRow) =>
        gridRow.some((cell) => visiableRowNodes?.has(cell.row.id))
      )
      filteredGridData.push(lastRow);
    }else if(xTree && !yTree){
      filteredGridData = data
      .map((gridRow) =>
        gridRow.filter((cell) => visiableColNodes?.has(cell.column.id))
        .concat(gridRow[gridRow.length - 1])
      );
    }
  }
  // filteredGridData.push(lastRow);
  if(filteredGridData){
    numRows = filteredGridData.length;
    numColumns = filteredGridData[0].length;
  }

  // Update vertical tree and grid position
  // by listening the filteredGridYData changes, which means a new search happens
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

  // Update horizontal tree and grid position
  // by listening the filteredGridXData changes, which means a new search happens
  useEffect(() => {
    if(filteredGridXData){
      const colIndex = filteredGridXData.findIndex((cell) => cell.column.id === searchedColID);
      const offset = colIndex * cellWidth - gridWidth / 2 - cellWidth / 2;
      columnLabelRef?.current?.scrollTo(offset, scrollTreeYIniPos);
      gridRef?.current?.scrollTo({ scrollTop: offset });
    }
  }, [filteredGridXData]);

  // Create a ref handle for this component
  useImperativeHandle(ref, () => ({
    // Scrolls to and sets the searched index to the given one
    searchRow: (index: string) => {
      setSearchedRowID(index);
      setSearchedColID(null);
      setSearchedColIndex(null);
    },
    searchRowIndex: (index: number) => {
      const offset = index * cellHeight - gridHeight / 2 - cellHeight / 2;
      rowLabelRef?.current?.scrollTo(offset);
      gridRef?.current?.scrollTo({ scrollTop: offset });
      setScrollY(offset);
      setSearchedRowIndex(index);
      setSearchedColIndex(null);
      setSearchedColID(null);
    },
    // Scrolls to and sets the searched index to the given one
    searchCol: (index: string) => {
      setSearchedRowID(null);
      setSearchedRowIndex(null);
      setSearchedColID(index);
    },
    searchColIndex: (index: number) => {
      const offset = index * cellWidth - gridWidth / 2 - cellWidth / 2;
      columnLabelRef.current.scrollTo(offset);
      gridRef.current.scrollTo({ scrollLeft: offset });
      setSearchedRowID(null);
      setSearchedRowIndex(null);
      setSearchedColIndex(index);
    },
    // Clears the searched indices
    clearSearch: () => {
      setSearchedRowID(null);
      setSearchedColID(null);
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
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollTop to get the similar data
    if(yTree){
      setScrollTreeX(rowLabelRef.current.scrollLeft);
      // Set Tree horizontal position
      setScrollY(rowLabelRef.current.scrollTop);
    }else{
      setScrollY(e.scrollOffset);
    }
  }, []);
  // Updates scroll position when column is scrolled
  const handleColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollTop to get the similar data
    if(xTree){
      setScrollX(columnLabelRef.current.scrollLeft);
      // Set Tree vertical position
      setScrollTreeY(columnLabelRef.current.scrollTop);
    }else{
      setScrollX(e.scrollOffset);
    }
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
    if(yTree){
      rowLabelRef.current.scrollTo(scrollTreeX, scrollY);
    }else{
      rowLabelRef.current.scrollTo(scrollY);
    }
    
    columnLabelRef.current.scrollTo(scrollX, scrollTreeY);
    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX, scrollTreeY]);

  // Data to be passed to Row, Column, and Grid Props
  const rowHeaderTreeData = useMemo(
    () => ({
      xTree,
      searchedRowID,
      hoveredRowID,
      setHoveredRowID,
      setHoveredColID,
      visiableRowNodes,
      setVisiableRowNodes,
      filteredGridYData,
      setFilteredGridYData,
      listData: data,
    }),
    [searchedRowID, hoveredRowID, data]
  );
  const columnHeaderTreeData = useMemo(
    () => ({
      searchedColID,
      hoveredColID,
      setHoveredColID,
      setHoveredRowID,
      setHoveredRowIndex,
      visiableColNodes,
      setVisiableColNodes,
      filteredGridXData,
      setFilteredGridXData,
      scrollTreeYIniPos,
      listData: data,
    }),
    [searchedColID, hoveredColID, scrollTreeYIniPos, data]
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
      searchedRowIndex,
      searchedColIndex,
      hoveredRowIndex,
      hoveredColIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      visiableRowNodes,
      setVisiableRowNodes,
      gridData: filteredGridData,
      colorScale,
    }),
    [searchedColID, searchedRowID, hoveredRowID, hoveredColID, hoveredRowIndex, hoveredColIndex, searchedRowIndex, searchedColIndex, filteredGridData, colorScale]
  );
  
  const rowHeaderData = useMemo(
    () => ({
      hoveredRowIndex,
      setHoveredRowIndex,
      setHoveredColIndex,
      setHoveredColID,
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
      setHoveredRowID,
      searchedColIndex,
      listData: data,
    }),
    [hoveredColIndex, searchedColIndex, data]
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
      {yTree ? (
        <RowTreeHeaders
          ref={rowLabelRef}
          cellHeight={cellHeight}
          cellWidth={cellWidth}
          width={rowHeaderWidth}
          top={columnHeaderHeight}
          height={gridHeight}
          itemCount={numRows}
          itemData={rowHeaderTreeData}
          treeData={yTree}
          treeNodes={yTreeNodes}
          treeNodesMap={yTreeNodesMap}
          onScroll={handleRowLabelScroll}
        />
      ):(
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
      )}
      {/* <RowTreeHeaders
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
      /> */}
      {xTree ? (
        <ColumnTreeHeaders
          ref={columnLabelRef}
          height={columnHeaderHeight}
          cellWidth={cellWidth}
          left={rowHeaderWidth}
          width={gridWidth}
          itemCount={numColumns}
          itemData={columnHeaderTreeData}
          treeData={xTree}
          treeNodes={xTreeNodes}
          treeNodesMap={xTreeNodesMap}
          onScroll={handleColumnLabelScroll}
        />
      ) : (
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
      )}
      {/* <ColumnTreeHeaders
        ref={columnLabelRef}
        height={columnHeaderHeight}
        cellWidth={cellWidth}
        left={rowHeaderWidth}
        width={gridWidth}
        itemCount={numColumns}
        itemData={columnHeaderData}
        treeData={xTree}
        treeNodes={xTreeNodes}
        treeNodesMap={xTreeNodesMap}
        onScroll={handleColumnLabelScroll}
      /> */}
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
