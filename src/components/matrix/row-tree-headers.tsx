import { forwardRef, memo, ForwardedRef, CSSProperties, useState, useEffect, useRef } from 'react';

// Shared common props for row header
import SharedRowHeaders, { SharedRowHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-row-headers';

// Data type used for treeview
import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { MatrixTreeDatum } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNode } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// Tree functions and sub components
import {checkParentChainExist, getParentChain} from '@isrd-isi-edu/deriva-webapps/src/utils/tree';
import { MemoizedMinusSquare, MemoizedPlusSquare, MemoizedCloseSquare, MemoizedRenderTree } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/tree-button';

// MUI tree components
import TreeView from '@mui/lab/TreeView';


type RowHeadersProps = SharedRowHeadersProps & {
  /**
   * y hierarchical data passed to each row
   */
  treeData: MatrixTreeDatum[];
  /**
   * y hierarchical data nodes passed to each row
   */
  treeNodes: TreeNode[];
  /**
   * y hierarchical data nodes map passed to each row
   */
  treeNodesMap: TreeNodeMap;
  /**
   * on scroll event
   */
  onScroll?: any;
};

/**
 * Virtualized row Header that displays headers as they scroll into the given height
 */
const RowTreeHeaders = (props: RowHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const {
    searchedRowID,
    listData,
    setFilteredGridYData,
    setVisiableRowNodes,
    isScrolling } = props.itemData;

  const [prevSearched, setPrevSearched] = useState<string | null>(null); // previous searched enrty
  const [expanded, setExpanded] = useState<string[]>([]); // all expanded nodes
  const [treeDataDict, setTreeDataDict] = useState<Record<string, MatrixTreeDatum>>({}); // Dictionary to store relationship of parent and child for tree data

  const [scrollableWidth, setScrollableWidth] = useState<number>(props.scrollableMaxWidth);

  const divRef = useRef<any>(null);
  /**
   * Styles for tree view and tree items
   */
  // the font size is 14 for this page
  const iconSize = 14;

  // style for the whole tree
  const rowTreeHeadersStyles: CSSProperties = {
    height: props.height,
    width: 'fit-content',
    overflowY: 'auto',
    overflowX: 'hidden',
    willChange: 'transform',
  };


  /**
   * Dynamically adjust the width of scrollable content
   */
  useEffect(() => {
    // Access the current width here
    const currentWidth = divRef.current.offsetWidth;
    if (currentWidth !== undefined) {
      setScrollableWidth(currentWidth);
    }
  }, [props.scrollable, props.scrollableMaxWidth]);

  /**
   * Initialize the dictionary to store relationship of parent and child for tree data
   */
  useEffect(() => {
    const initialTreeDataDict = props.treeData.reduce((dict: Record<string, MatrixTreeDatum>, node: MatrixTreeDatum) => {
      dict[node.child_id] = node;
      return dict;
    }, {});
    setTreeDataDict(initialTreeDataDict);
  }, [props.treeData]);

  /**
   * Refresh visiableRowNodes and filteredGridYData whenever expanded nodes change,
   * update previous Searched entry as well.
   * This means the header and grid data should sync whenever expanded nodes change
   */
  useEffect(() => {
    const newSet = new Set<string>();
    // Add all top nodes by default
    for (const node of props.treeNodes) {
      newSet.add(node.key);
    }
    // Check visibility and add all visiable nodes to the set
    const nodesSet: Set<string> = new Set(expanded);
    expanded.forEach(nodeId => {
      const visible = checkParentChainExist(treeDataDict, nodeId, nodesSet);
      if (!visible) return;
      const node = props.treeNodesMap[nodeId];
      if (!node || node.children.length === 0) return;
      if (node.children.length > 0) {
        for (const child of node.children) {
          newSet.add(child.key);
        }
      }
    });
    setVisiableRowNodes(newSet);
    // If there is an update to the searched row entry, then update filteredGridData for locating function
    if (searchedRowID && prevSearched !== searchedRowID) {
      let filteredGridData: ParsedGridCell[][] = listData;
      const numRows = listData.length;
      const lastRow: ParsedGridCell[] = listData[numRows - 1]; // Store a copy of the last row
      if (newSet) {
        filteredGridData = listData.filter((gridRow: ParsedGridCell[]) => {
          return gridRow.some((cell) => newSet.has(cell.row.id));
        });
      }
      filteredGridData.push(lastRow);
      setFilteredGridYData(filteredGridData);
      setPrevSearched(searchedRowID);
    }
  }, [expanded]);

  /**
   * Refresh the expanded nodes list when search a row
   */
  useEffect(() => {
    if (searchedRowID) {
      const nodesSet: Set<string> = new Set(expanded);
      const newNodesSet = getParentChain(treeDataDict, searchedRowID, nodesSet);
      const newExpanded: string[] = Array.from(newNodesSet);
      setExpanded(newExpanded);
    }
  }, [searchedRowID]);

  /**
   * Handle toggle in tree view
   */
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  return (
    <SharedRowHeaders {...props}>
      {/* The below div is for handling the scroll behaviour in vertical direction */}
      <div
        className='grid-row-headers'
        style={rowTreeHeadersStyles}
        ref={ref}
        onScroll={props.onScroll}>

          <TreeView
            className='grid-row-headers-treeview'
            aria-label='rich object'
            defaultExpanded={['root']}
            defaultCollapseIcon={<MemoizedMinusSquare isLeft={false} cellSize={props.cellHeight} iconSize={iconSize} />}
            defaultExpandIcon={<MemoizedPlusSquare isLeft={false} cellSize={props.cellHeight} iconSize={iconSize} />}
            defaultEndIcon={<MemoizedCloseSquare isLeft={false} cellSize={props.cellHeight} />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            ref={divRef}
          >
            <MemoizedRenderTree
              nodes={props.treeNodes}
              data={props.itemData}
              cellSize={props.cellHeight}
              treeNodesMap={props.treeNodesMap}
              isScrolling={isScrolling}
              scrollableSize={scrollableWidth}
              isColumn={false}
            />
          </TreeView>
          {/* For the highlight alignment issue, we're adding empty cells and headers in the falt row headers. 
            But Mui is ignoring the empty tree elements. So we add an element after trees manually */}
          <div style={{ height: props.cellHeight + 15 }}></div>
      </div>
    </SharedRowHeaders>
  );
};

export default memo(forwardRef(RowTreeHeaders));
