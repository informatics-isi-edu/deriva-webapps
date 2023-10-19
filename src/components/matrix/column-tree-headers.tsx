import { memo, forwardRef, ForwardedRef, CSSProperties, useState, useEffect, useRef } from 'react';

// Shared common props for column header
import SharedColumnHeaders, { SharedColumnHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-column-headers';

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
    scrollTreeYIniPos,
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
    if (props.scrollable && props.scrollableMaxHeight === -1){
      // Access the current width here
      const currentHeight = divRef.current.clientWidth;
      if (currentHeight !== undefined) {
        setScrollableHeight(currentHeight);
      }
    }
  }, [expanded]);

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
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  return (
    <SharedColumnHeaders {...props}>
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

          <TreeView
            aria-label='rich object'
            defaultExpanded={['root']}
            defaultCollapseIcon={<MemoizedMinusSquare cellWidth={props.cellWidth} iconSize={iconSize} />}
            defaultExpandIcon={<MemoizedPlusSquare cellWidth={props.cellWidth} iconSize={iconSize} />}
            defaultEndIcon={<MemoizedCloseSquare cellWidth={props.cellWidth} />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            ref={divRef}
            style={{
              // height: 'fit-content',
              // width: 'fit-content',
              position: 'absolute',
              /**
               * For vertical scrolling function of the horizontal tree, we only want to scroll up. But after using
               * transform, there is a blank space at the bottom of the tree. To eliminate the space, we set 
               * transformOrigin to 'top left'. Then the initial y position of the tree does not focus on the tree 
               * entries but blanks. So we set 'left' attribute to it and use a variable to memorize the position
               * of the tree entries, then update it whenever scroll the tree vertically.
               */
              // left: -scrollTreeYIniPos, // Adjust the left value based on the desired position
              left: -scrollableHeight, // Adjust the left value based on the desired position
              /**
               * For the highlight alignment issue, we're adding empty cells and headers in the falt column headers.
               * But Mui is ignoring the empty tree elements, and we use 'transform' for the tree in column header.
               * So we add a paddingBottom attribute as the style of the tree manually. 
               */
              paddingBottom: props.cellWidth + 15,
            }}
            sx={{ overflow: 'clip' }}
          >
            <MemoizedRenderTree
              nodes={props.treeNodes}
              data={props.itemData}
              cellWidth={props.cellWidth}
              treeNodesMap={props.treeNodesMap}
              isScrolling={isScrolling}
              scrollableHeight={scrollableHeight}
            />
          </TreeView>
        </div>
      </div>
    </SharedColumnHeaders>
  );
};


/**
 * Create a component that customizes the minus square icon for tree view and then memorize it 
 */
type MemoizedIconSquareProps = {
  cellWidth: number;
  iconSize: number;
};
const MemoizedMinusSquare = memo(({ cellWidth, iconSize }: MemoizedIconSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginLeft: 5.5,
        paddingLeft: 2,
        height: (cellWidth - iconSize) / 2,
        marginBottom: -4,
        borderLeft: '1px dotted grey'
      }}
    />
    <i className='fa-regular fa-square-minus'></i>
    <div
      style={{
        position: 'absolute',
        marginTop: -11,
        marginLeft: 13,
        width: 10,
        borderTop: '1px dotted grey'
      }}
    />
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellWidth - iconSize) / 2,
        marginTop: -4,
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
const MemoizedPlusSquare = memo(({ cellWidth, iconSize }: MemoizedIconSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginLeft: 5.5,
        paddingLeft: 2,
        height: (cellWidth - iconSize) / 2,
        marginBottom: -4,
        borderLeft: '1px dotted grey'
      }}
    />
    <i className='fa-regular fa-square-plus'></i>
    <div
      style={{
        position: 'absolute',
        marginTop: -11,
        marginLeft: 13,
        width: 10,
        borderTop: '1px dotted grey'
      }}
    />
    <div
      style={{
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellWidth - iconSize) / 2,
        marginTop: -4,
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
  cellWidth: number;
};
const MemoizedCloseSquare = memo(({ cellWidth }: MemoizedCloseSquareProps) => (
  <div style={{ zIndex: 1 }}>
    <div
      style={{
        marginLeft: 16.5,
        paddingLeft: 2,
        height: cellWidth,
        marginTop: -(cellWidth / 2),
        borderLeft: '1px dotted grey'
      }}
    />
    <div
      style={{
        marginTop: -(cellWidth / 2),
        marginLeft: 18,
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
  cellWidth: number;
  treeNodesMap: TreeNodeMap;
  isScrolling: boolean;
  scrollableHeight: number;
};

const MemoizedRenderTree = memo(({ nodes, data, cellWidth, treeNodesMap, isScrolling, scrollableHeight }: MemoizedRenderTreeProps) => {
  const {
    searchedColID,
    hoveredColID,
    setHoveredColID,
    setHoveredRowID } = data;

  // style for the background of each entry
  const rowTreeItemOuterBgStyles: CSSProperties = {
    position: 'relative',
    top: 0,
    left: -50,
  };

  // style for each entry
  const rowTreeItemBgStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -scrollableHeight,
    width: 3 * scrollableHeight,
    height: cellWidth,
    zIndex: 0,
  };

  // style for the background of each entry when hover
  const rowTreeItemBgStylesHover: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -scrollableHeight,
    width: 3 * scrollableHeight,
    height: cellWidth,
    zIndex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Grey color with 50% opacity
  };

  // style for the background of each entry when searched
  const rowTreeItemBgStylesSearch: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -scrollableHeight,
    width: 3 * scrollableHeight,
    height: cellWidth,
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
  const updateColId = (nodeId: string) => {
    if (!isScrolling) {
      setHoveredColID(nodeId);
      setHoveredRowID(null);
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

    const linkClassName = nodeId === hoveredColID ? 'hovered-header' : 'unhovered-header';

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
        onMouseEnter={() => updateColId(nodeId)}
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
          <a
            href={link}
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
    const isNodeKeyMatched = node.key === hoveredColID;
    // Check if the node key matches the searched row id
    const isNodeKeyMatchedSearch = node.key === searchedColID;

    return (
      <div>
        {/* Element before TreeItem to show the interaction background */}
        <div className='hoverBackground' style={rowTreeItemOuterBgStyles} onMouseEnter={() => updateColId(node.key)}>
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
      marginLeft: 15,
      paddingLeft: 4,
      borderLeft: `1px dotted ${alpha(theme.palette.text.primary, 0.4)}`
    },
    [`& .${treeItemClasses.label}`]: {
      marginRight: 12,
      width: '100%',
      whiteSpace: 'nowrap', // Ensures the text appears in a single line
    },
    [`& .${treeItemClasses.content}`]: {
      height: cellWidth,

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

export default memo(forwardRef(ColumnHeaders));
