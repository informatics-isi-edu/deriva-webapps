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
  RowScrollBar,
  ColumnScrollBar,
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/grid-scrollbar';

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
  const [scrollTreeYIniPos, setScrollTreeYIniPos] = useState<number>(0); // y position for scrolling horizontal treeview
  const [filteredGridData, setFilteredGridData] = useState<ParsedGridCell[][] | null>(data);

  // track scrolling
  const [isScrolling, setIsScrolling] = useState(false); // State to track whether scrolling is happening
  const scrollTimeoutRef = useRef<number | null>(null); // Ref to track a timerId
  /**
   * When use Firefox, after refresh the page, the horizontal treeview y position, which is 'scrollTreeY'
   * will change to 0, which results the horizontal tree goes to the very top and shows only blank.
   * This does not happen in Safari, Chrome, and not happen when reload the page in Firefox.
   * Only happens when refresh the page in Firefox.
   * To fix it, use a state to track whether this is the first time to load the page, if it is,
   * then force the horizontal treeview y position go to the very bottom.
   */
  const [isRefresh, setIsRefresh] = useState(false); // State to track whether this is the initial loading

  const rowLabelRef = useRef<any>(null);
  const columnLabelRef = useRef<any>(null);
  const gridRef = useRef<any>(null);

  const rowScrollBarRef = useRef<any>(null);
  const columnScrollBarRef = useRef<any>(null);

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

  // Initialize the dummy scrollbar at the bottom of the row headers
  useEffect(() => {
    if (yTree && rowLabelRef.current && rowScrollBarRef.current) {
      addBottomHorizontalScroll(rowLabelRef.current, rowScrollBarRef.current);
    }
  }, []);

  // Initialize the dummy scrollbar at the right of the column headers
  useEffect(() => {
    if (scrollTreeYIniPos!==0 && xTree && columnLabelRef.current && columnScrollBarRef.current) {
      addRightVerticalScroll(columnLabelRef.current, columnScrollBarRef.current, scrollTreeYIniPos);
    }
  }, [scrollTreeYIniPos]);

  // Initialize the inner vertical position of the horizontal tree
  useEffect(() => {
    if (xTreeNodes) {
      const { maxLayers, maxTitleLength } = getMaxLayersAndTitleLength(xTreeNodes);
      // Font size is 14px in this page
      const yPositionXTree = maxLayers * maxTitleLength * 14;
      setScrollTreeYIniPos(yPositionXTree);
      setScrollTreeY(yPositionXTree);
      // mark this is the initial page loading
      setIsRefresh(true);
    }
  }, [xTreeNodes]);

  /**
   * Filter the visiable rows and columns in GridData whenever visiableRowNodes or visiableColNodes changes
   * which means there are tree nodes expand or collapse
   */
  useEffect(() => {
    if(xTree || yTree){
      let newData : ParsedGridCell[][] = data;
      const lastRow: ParsedGridCell[] = data[data.length-1]; // Store a copy of the last row
      if(xTree && yTree){
        newData = data
        .filter((gridRow) =>
          gridRow.some((cell) => visiableRowNodes?.has(cell.row.id))
        )
        .map((gridRow) =>
          gridRow.filter((cell) => visiableColNodes?.has(cell.column.id))
          .concat(gridRow[gridRow.length - 1])
        );
        newData.push(lastRow);
      }else if(!xTree && yTree){
        newData = data
        .filter((gridRow) =>
          gridRow.some((cell) => visiableRowNodes?.has(cell.row.id))
        )
        newData.push(lastRow);
      }else if(xTree && !yTree){
        newData = data
        .map((gridRow) =>
          gridRow.filter((cell) => visiableColNodes?.has(cell.column.id))
          .concat(gridRow[gridRow.length - 1])
        );
      }
      setFilteredGridData(newData);
      setNumRows(newData.length);
      setNumColumns(newData[0].length);
    }
  }, [visiableRowNodes, visiableColNodes, data]);

  /**
   * Update vertical tree and grid position to a specific entry
   * by listening the filteredGridYData changes, which means a new search happens
   * This is because a new search will change the expanded nodes which will effect
   * the data shown in both header component and grid
   */
  useEffect(() => {
    if(searchedRowID){
      let rowIndex;
      if(filteredGridYData !== null && filteredGridYData.length > 0){
        rowIndex = filteredGridYData.findIndex((gridRow) => {
          return gridRow.some((cell) => cell.row.id === searchedRowID);
        });
      }else{
        rowIndex = data.findIndex((gridRow) => {
          return gridRow.some((cell) => cell.row.id === searchedRowID);
        });

      }
      const offset = rowIndex * cellHeight - gridHeight / 2 - cellHeight / 2;
      setScrollY(offset);
      setScrollTreeX(0);
    }
  }, [filteredGridYData, cellHeight, gridHeight, searchedRowID, data]);

  /**
   * Update horizontal tree and grid position to a specific entry
   * by listening the filteredGridXData changes, which means a new search happens
   */
  useEffect(() => {
    if(searchedColID){
      let colIndex;
      if(filteredGridXData !== null && filteredGridXData.length > 0){
        colIndex = filteredGridXData.findIndex((cell) => cell.column.id === searchedColID);
      }else{
        colIndex = data[0].findIndex((cell) => cell.column.id === searchedColID);
      }
      const offset = colIndex * cellWidth - gridWidth / 2 - cellWidth / 2;
      setScrollX(offset);
      setScrollTreeY(scrollTreeYIniPos);
    }
  }, [cellWidth, filteredGridXData, gridWidth, scrollTreeYIniPos, searchedColID, data]);

  // Create a ref handle for this component
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

  // Updates scroll position when grid is scrolled
  const handleGridScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollX(e.scrollLeft);
    setScrollY(e.scrollTop);
  }, []);
  // Updates scroll position for Y tree when row is scrolled
  const handleTreeRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollTop to get the similar data
    setScrollTreeX(rowLabelRef.current.scrollLeft);
    // Set Tree horizontal position
    setScrollY(rowLabelRef.current.scrollTop);

    /**
     * In order to improve performance, especially when scrolling the tree component, 
     * the function to update row and column id is executed continuously, 
     * which is experimentally proven to make the scroll behavior significantly delayed. 
     * Referring to the flat component that will pause the execution of update operation when scrolling, 
     * we set a debounce function to record whether there is a scroll operation currently, 
     * if it is in progress, then stop the execution of update, otherwise, we can execute the update.
     */
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
  // Updates scroll position for X tree when column is scrolled
  const handleTreeColumnLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    // The tree component does not have the event contains scrollOffset
    // So use ref to get the scrollTop to get the similar data
    setScrollX(columnLabelRef.current.scrollLeft);
    // Set Tree vertical position
    setScrollTreeY(columnLabelRef.current.scrollTop);
    /**
     * Same reason as handleTreeRowLabelScroll
     */
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
  // Updates scroll position for flat Y component when row is scrolled
  const handleRowLabelScroll = useCallback((e: any) => {
    if (e.scrollUpdateWasRequested) return;
    setScrollY(e.scrollOffset);
  }, []);
  // Updates scroll position for flat X component when column is scrolled
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

  /**
   * Effect for updating scroll position of row, column and grid when it detects scroll changes
   * The tree components need one additional position parameters for another dimension
   */
  useEffect(() => {
    if(yTree){
      rowLabelRef.current.scrollTo(scrollTreeX, scrollY);
    }else{
      rowLabelRef.current.scrollTo(scrollY);
    }

    if(xTree){
      columnLabelRef.current.scrollTo(scrollX, scrollTreeY);
      // If there is a page refresh, then force the column tree header go to the very bottom
      if(isRefresh){
        columnLabelRef.current.scrollTo(scrollX, scrollTreeYIniPos);
        setIsRefresh(false);
      }
    }else{
      columnLabelRef.current.scrollTo(scrollX);
    }

    gridRef.current.scrollTo({
      scrollLeft: scrollX,
      scrollTop: scrollY,
    });
  }, [scrollY, scrollX, scrollTreeY, scrollTreeX, xTree, yTree]);

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
      scrollTreeYIniPos,
      isScrolling,
      listData: data,
    }),
    [searchedColID, hoveredColID, scrollTreeYIniPos, data, isScrolling]
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
      {/* Switch components to treeview one instead of flat one if yTree data exists */}
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
          treeNodes={yTreeNodes ?? []}
          treeNodesMap={yTreeNodesMap ?? {}}
          onScroll={handleTreeRowLabelScroll}
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
      {/* Switch components to treeview one instead of flat one if xTree data exists */}
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
      <RowScrollBar
        ref={rowScrollBarRef}
        headerWidthOrHeight={rowHeaderWidth}
      />
      {/* Dummy scrollbar for the column headers */}
      <ColumnScrollBar
        ref={columnScrollBarRef}
        headerWidthOrHeight={columnHeaderHeight}
      />
      {showRight && <GridRightButton onClick={pressScrollRight} rowHeaderWidth={rowHeaderWidth} />}
      {showUp && <GridUpButton onClick={pressScrollUp} rowHeaderWidth={rowHeaderWidth} />}
      {showLeft && <GridLeftButton onClick={pressScrollLeft} rowHeaderWidth={rowHeaderWidth} />}
      {showDown && <GridDownButton onClick={pressScrollDown} rowHeaderWidth={rowHeaderWidth} />}
    </div>
  );
};

export default forwardRef(VirtualizedGrid);
