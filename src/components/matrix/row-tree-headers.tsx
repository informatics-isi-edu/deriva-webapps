import { forwardRef, memo, ForwardedRef, CSSProperties, useState, useEffect, useRef } from 'react';

// Shared common props for row header
import SharedRowHeaders, { SharedRowHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-row-headers';

// Data type used for treeview
import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { MatrixTreeDatum } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNode } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// MUI tree components
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
import TreeItem, { TreeItemProps, treeItemClasses, useTreeItem, TreeItemContentProps } from '@mui/lab/TreeItem';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';


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
  };


  /**
   * Dynamically adjust the width of scrollable content
   */
  useEffect(() => {
    // if (props.scrollable && props.scrollableMaxWidth === -1){
      // Access the current width here
      const currentWidth = divRef.current.offsetWidth;
      if (currentWidth !== undefined) {
        setScrollableWidth(currentWidth);
      }
    // }
  }, [props.scrollable, props.scrollableMaxWidth]);


  /**
   * Check whether all ancestors of a node exist in visitedNode list
   */
  const checkParentChainExist = (treeDataDict: Record<string, MatrixTreeDatum>, nodeId: string, visitedNodes: Set<string>): boolean => {
    const node = treeDataDict[nodeId];
    if (node.parent_id === null) {
      return true; // Reached the top of the chain
    }
    if (!visitedNodes.has(node.parent_id)) {
      return false; // Detected the parent node does not exist in visitedNodes
    }
    return checkParentChainExist(treeDataDict, node.parent_id, visitedNodes);
  };

  /**
   * Find all ancestor nodes of the searched node
   */
  const getParentChain = (treeDataDict: Record<string, MatrixTreeDatum>, nodeId: string, visitedNodes: Set<string>): Set<string> => {
    let node = treeDataDict[nodeId];
    if (node.parent_id === null) {
      return visitedNodes; // Reached the top of the chain
    }
    node = treeDataDict[node.parent_id];
    while (node && node.child_id !== null) {
      visitedNodes.add(node.child_id);
      node = treeDataDict[node.parent_id];
    }
    return visitedNodes;
  };

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
            aria-label='rich object'
            defaultExpanded={['root']}
            defaultCollapseIcon={<MemoizedMinusSquare cellHeight={props.cellHeight} iconSize={iconSize} />}
            defaultExpandIcon={<MemoizedPlusSquare cellHeight={props.cellHeight} iconSize={iconSize} />}
            defaultEndIcon={<MemoizedCloseSquare cellHeight={props.cellHeight} />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            ref={divRef}
          >
            <MemoizedRenderTree
              nodes={props.treeNodes}
              data={props.itemData}
              cellHeight={props.cellHeight}
              treeNodesMap={props.treeNodesMap}
              isScrolling={isScrolling}
              scrollableWidth={scrollableWidth}
            />
          </TreeView>
          {/* For the highlight alignment issue, we're adding empty cells and headers in the falt row headers. 
            But Mui is ignoring the empty tree elements. So we add an element after trees manually */}
          <div style={{ height: props.cellHeight + 15 }}></div>
      </div>
    </SharedRowHeaders>
  );
};

/**
 * Create a component that customizes the minus square icon for tree view and then memorize it 
 */
type MemoizedIconSquareProps = {
  cellHeight: number;
  iconSize: number;
};
const MemoizedMinusSquare = memo(({ cellHeight, iconSize }: MemoizedIconSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellHeight - iconSize) / 2,
        marginBottom: -3,
        borderRight: '1px dotted grey'
      }}
    />
    <i className='fa-regular fa-square-minus'></i>
    <div
      style={{
        position: 'relative',
      }}>
      <div
        style={{
          position: 'absolute',
          marginTop: -11,
          marginRight: 13,
          width: 10,
          borderTop: '1px dotted grey'
        }}
      />
    </div>
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellHeight - iconSize) / 2,
        marginTop: -3,
        borderRight: '1px dotted grey'
      }}
    />
  </div>
));
// Add displayName to the functional component
MemoizedMinusSquare.displayName = 'MemoizedMinusSquare';

/**
 * Create a component that customizes the plus square icon for tree view and then memorize it 
 */
const MemoizedPlusSquare = memo(({ cellHeight, iconSize }: MemoizedIconSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellHeight - iconSize) / 2,
        marginBottom: -3,
        borderRight: '1px dotted grey'
      }}
    />
    <i className='fa-regular fa-square-plus'></i>
    <div
      style={{
        position: 'relative',
      }}>
      <div
        style={{
          position: 'absolute',
          marginTop: -11,
          marginRight: 13,
          width: 10,
          borderTop: '1px dotted grey'
        }}
      />
    </div>
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellHeight - iconSize) / 2,
        marginTop: -3,
        borderRight: '1px dotted grey'
      }}
    />
  </div>
));
// Add displayName to the functional component
MemoizedPlusSquare.displayName = 'MemoizedPlusSquare';

/**
 * Create a component that customizes the close square icon for tree view and then memorize it 
 */
type MemoizedCloseSquareProps = {
  cellHeight: number;
};
const MemoizedCloseSquare = memo(({ cellHeight }: MemoizedCloseSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginRight: 16.5,
        paddingRight: 2,
        height: cellHeight,
        marginTop: -(cellHeight / 2),
        borderRight: '1px dotted grey'
      }}
    />
    <div
      style={{
        marginTop: -(cellHeight / 2),
        marginRight: 18,
        width: 16,
        borderTop: '1px dotted grey'
      }}
    />
  </div>
));
// Add displayName to the functional component
MemoizedCloseSquare.displayName = 'MemoizedCloseSquare';


/**
 * Create a component that renders the tree (the renderTree function) and then memorize it 
 */
type MemoizedRenderTreeProps = {
  nodes: TreeNode[];
  data: any;
  cellHeight: number;
  treeNodesMap: TreeNodeMap;
  isScrolling: boolean;
  scrollableWidth: number;
};

const MemoizedRenderTree = memo(({ nodes, data, cellHeight, treeNodesMap, isScrolling, scrollableWidth }: MemoizedRenderTreeProps) => {
  const {
    searchedRowID,
    hoveredRowID,
    setHoveredRowID,
    setHoveredColID } = data;

  // style for the background of each entry
  const rowTreeItemOuterBgStyles: CSSProperties = {
    position: 'relative',
    top: 0,
    left: 0,
  };

  // style for each entry
  const rowTreeItemBgStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2 * scrollableWidth,
    height: cellHeight,
    zIndex: 0,
  };

  // style for the background of each entry when hover
  const rowTreeItemBgStylesHover: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2 * scrollableWidth,
    height: cellHeight,
    zIndex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Grey color with 50% opacity
  };

  // style for the background of each entry when searched
  const rowTreeItemBgStylesSearch: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2 * scrollableWidth,
    height: cellHeight,
    zIndex: 0,
    backgroundColor: 'rgba(247, 240, 207, 0.7)', // light yellow color
  };

  // Extends MUI TreeItemProps to implement custom props
  interface CustomTreeItemProps extends TreeItemProps {
    node: TreeNode;
  }

  /**
   * Update id or index for when hover an item
   */
  const updateRowId = (nodeId: string) => {
    if (!isScrolling) {
      setHoveredColID(null);
      setHoveredRowID(nodeId);
    }
  };

  /**
   * Customize tree item so that the link function and expand/collapse function are separate
   */
  const CustomContent = forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref
  ) {
    const {
      classes,
      className,
      label,
      nodeId,
      icon: iconProp,
      expansionIcon,
      displayIcon
    } = props;

    const {
      disabled,
      expanded,
      selected,
      focused,
      handleExpansion,
      handleSelection,
      preventSelection
    } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      preventSelection(event);
    };

    const handleExpansionClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      handleExpansion(event);
    };

    const handleSelectionClick = (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      handleSelection(event);
    };

    const link = treeNodesMap[nodeId].link;

    const linkClassName = nodeId === hoveredRowID ? 'hovered-header' : 'unhovered-header';

    return (
      <div
        role='button'
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled
        })}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => updateRowId(nodeId)}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        <div role='button' onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography
          onClick={handleSelectionClick}
          component='div'
          className={classes.label}
        >
          <a href={link}
            className={linkClassName}>
            {label}
          </a>
        </Typography>
      </div>
    );
  });

  /**
   * Define interaction and style for tree item
   */
  const StyledTreeItem = memo(styled(({ node, ...props }: CustomTreeItemProps) => {
    // Check if the node key matches the hovered row id
    const isNodeKeyMatched = node.key === hoveredRowID;
    // Check if the node key matches the searched row id
    const isNodeKeyMatchedSearch = node.key === searchedRowID;

    return (
      <div>
        {/* Element before TreeItem to show the interaction background */}
        <div className='hoverBackground' style={rowTreeItemOuterBgStyles} onMouseEnter={() => updateRowId(node.key)}>
          <div
            style={
              isNodeKeyMatchedSearch
                ? rowTreeItemBgStylesSearch
                : isNodeKeyMatched
                  ? rowTreeItemBgStylesHover
                  : rowTreeItemBgStyles
            }
          ></div>
        </div>

        {/* TreeItem component */}
        <TreeItem ContentComponent={CustomContent} {...props} />
      </div>
    );
  })(({ theme }) => ({
    [`& .${treeItemClasses.iconContainer}`]: {
      '& .close': {
        opacity: 0.3
      }
    },
    [`& .${treeItemClasses.group}`]: {
      marginRight: 19,
      paddingRight: 4,
      borderRight: `1px dotted ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    [`& .${treeItemClasses.label}`]: {
      marginRight: 12,
      width: '100%',
      whiteSpace: 'nowrap', // Ensures the text appears in a single line
    },
    [`& .${treeItemClasses.content}`]: {
      height: cellHeight,

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },

      // eslint-disable-next-line max-len
      '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused, &.Mui-expanded.Mui-selected.Mui-focused, &.Mui-expanded.Mui-selected, &.Mui-expanded.Mui-focused': {
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
    },
  })));

  /**
   * Render the tree view nodes layer by layer
   */
  const renderTree = (nodes: TreeNode[]) => {
    return nodes.map((node) => (
      <StyledTreeItem
        key={node.link}
        nodeId={node.key}
        label={node.title}
        className='MUI-tree'
        node={node}
      >
        {Array.isArray(node.children) ? renderTree(node.children) : null}
      </StyledTreeItem>
    ));
  };
  return <>{renderTree(nodes)}</>;
});

// Add displayName to the functional component
MemoizedRenderTree.displayName = 'MemoizedRenderTree';

export default memo(forwardRef(RowTreeHeaders));
