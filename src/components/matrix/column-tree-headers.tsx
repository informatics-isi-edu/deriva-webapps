import {
  memo,
  forwardRef,
  ForwardedRef,
  CSSProperties,
  useState,
  useEffect,
  useRef,
  type JSX,
} from 'react';

// Shared common props for column header
import SharedColumnHeaders, { SharedColumnHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-column-headers';

// Data type used for treeview
import { ParsedGridCell, MatrixTreeDatum, TreeNode, TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// Tree functions and sub components
import { checkParentChainExist, getParentChain } from '@isrd-isi-edu/deriva-webapps/src/utils/tree';
import {
  MemoizedMinusSquare, MemoizedPlusSquare, MemoizedCloseSquare, MemoizedRenderTree
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/tree-button';

// MUI tree components
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import { getScrollbarSize } from '@isrd-isi-edu/deriva-webapps/src/utils/ui-utils';


type ColumnHeadersProps = SharedColumnHeadersProps & {
  /**
   * x hierarchical data passed to each column
   */
  treeData: MatrixTreeDatum[];
  /**
   * x hierarchical data nodes passed to each column
   */
  treeNodes: TreeNode[];
  /**
   * x hierarchical data nodes map passed to each column
   */
  treeNodesMap: TreeNodeMap;
  /**
   * on scroll event
   */
  onScroll?: any;
};

/**
 * Virtualized Column Header that displays headers as they scroll into the given width
 */
const ColumnHeaders = (props: ColumnHeadersProps, ref: ForwardedRef<any>): JSX.Element => {

  const {
    searchedColID,
    listData,
    setFilteredGridXData,
    setVisiableColNodes,
    isScrolling } = props.itemData;

  const [prevSearched, setPrevSearched] = useState<string | null>(null); // previous searched enrty
  const [expanded, setExpanded] = useState<string[]>([]); // all expanded nodes
  const [treeDataDict, setTreeDataDict] = useState<Record<string, MatrixTreeDatum>>({}); // Dictionary to store relationship of parent and child for tree data

  const [scrollableHeight, setScrollableHeight] = useState<number>(props.scrollableMaxHeight);
  const divRef = useRef<any>(null);
  /**
   * styles for tree view and tree items
   */
  // the font size is 14 for this page
  const iconSize = 14;

  // style for the whole tree
  const columnTreeHeadersStyles: CSSProperties = {
    overflowX: 'auto',
    overflowY: 'hidden',
    height: scrollableHeight,
    willChange: 'transform',
  };

  /**
   * Dynamically adjust the width of scrollable content
   */
  useEffect(() => {
    if (props.scrollable && props.scrollableMaxHeight === -1) {
      // Access the current width here
      const currentHeight = divRef.current.clientWidth;
      if (currentHeight !== undefined) {
        setScrollableHeight(currentHeight);
      }
    }
  }, [expanded]);

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
   * Refresh visiableRowNodes and filteredGridXData whenever expanded nodes change,
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
    expanded.forEach(itemId => {
      const visible = checkParentChainExist(treeDataDict, itemId, nodesSet);
      if (!visible) return;
      const node = props.treeNodesMap[itemId];
      if (!node || node.children.length === 0) return;
      if (node.children.length > 0) {
        for (const child of node.children) {
          newSet.add(child.key);
        }
      }
    });
    setVisiableColNodes(newSet);
    // If there is an update to the searched row entry, then update filteredGridData for locating function
    if (searchedColID && prevSearched !== searchedColID) {
      let filteredGridData: ParsedGridCell[] = listData[0];

      if (newSet) {
        filteredGridData = listData[0].filter((cell: ParsedGridCell) => newSet.has(cell.column.id));
      }

      setFilteredGridXData(filteredGridData);
      setPrevSearched(searchedColID);
    }
  }, [expanded]);

  /**
   * Refresh the expanded nodes list when search a row
   */
  useEffect(() => {
    if (searchedColID) {
      const nodesSet: Set<string> = new Set(expanded);
      const newNodesSet = getParentChain(treeDataDict, searchedColID, nodesSet);
      const newExpanded: string[] = Array.from(newNodesSet);
      setExpanded(newExpanded);
    }
  }, [searchedColID]);

  /**
   * Handle toggle in tree view
   */
  const handleToggle = (event: React.SyntheticEvent, itemIds: string[]) => {
    setExpanded(itemIds);
  };

  return (
    <SharedColumnHeaders innerColumnHeaderHeight={scrollableHeight} {...props}>
      <div
        className='grid-column-headers'
        style={columnTreeHeadersStyles}
        onScroll={props.onScroll}
        ref={ref}
      >
        <div
          style={{
            transformOrigin: 'top left',
            transform: 'rotate(-90deg)',
          }}>

          <SimpleTreeView
            className='grid-column-headers-treeview'
            aria-label='rich object'
            defaultExpandedItems={['root']}
            slots={{
              collapseIcon: () => <MemoizedMinusSquare isLeft={true} cellSize={props.cellWidth} iconSize={iconSize} />,
              expandIcon: () => <MemoizedPlusSquare isLeft={true} cellSize={props.cellWidth} iconSize={iconSize} />,
              endIcon: () => <MemoizedCloseSquare isLeft={true} cellSize={props.cellWidth} />
            }}
            expandedItems={expanded}
            onExpandedItemsChange={handleToggle}
            ref={divRef}
            sx={{
              position: 'absolute',
              /**
               * For vertical scrolling function of the horizontal tree, we only want to scroll up. But after using
               * transform, there is a blank space at the bottom of the tree. To eliminate the space, we set
               * transformOrigin to 'top left'. Then the initial y position of the tree does not focus on the tree
               * entries but blanks. So we set 'left' attribute to it and use a variable to memorize the position
               * of the tree entries, then update it whenever scroll the tree vertically.
               */
              // Adjust the left value based on the desired position
              left: -scrollableHeight,
              /**
               * For the highlight alignment issue, we're adding empty cells and headers in the falt column headers.
               * But Mui is ignoring the empty tree elements, and we use 'transform' for the tree in column header.
               * So we add a paddingBottom attribute as the style of the tree manually.
               */
              paddingBottom: props.cellWidth + getScrollbarSize('.grid'),
              overflow: 'clip'
            }}
          >
            <MemoizedRenderTree
              nodes={props.treeNodes}
              data={props.itemData}
              cellSize={props.cellWidth}
              treeNodesMap={props.treeNodesMap}
              isScrolling={isScrolling}
              scrollableSize={scrollableHeight}
              isColumn={true}
            />
          </SimpleTreeView>
        </div>
      </div>
    </SharedColumnHeaders>
  );
};

export default memo(forwardRef(ColumnHeaders));
