import { memo, forwardRef, ForwardedRef, CSSProperties, useState, useEffect } from 'react';

// Data type used for treeview
import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { MatrixTreeDatum } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNode } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// MUI tree components
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
import TreeItem, { TreeItemProps, treeItemClasses, useTreeItem, TreeItemContentProps } from '@mui/lab/TreeItem';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';


type ColumnHeadersProps = {
  /**
   * height of grid cell
   */
  cellHeight?: number;
  /**
   * width of grid cell
   */
  cellWidth: number;
  /**
   *  height of each column header
   */
  height: number;
  /**
   * width of all column headers
   */
  width: number;
  /**
   * number of columns
   */
  itemCount: number;
  /**
   * data passed to each column
   */
  itemData?: any;
  /**
  *  x hierarchical data passed to each column
  */
  treeData: MatrixTreeDatum[];
  /**
   *  x hierarchical data nodes passed to each column
   */
  treeNodes: TreeNode[];
  /**
   *  x hierarchical data nodes map passed to each column
   */
  treeNodesMap: TreeNodeMap;
  /**
   * left position of column
   */
  left: number;
  /**
   * on scroll event
   */
  onScroll?: any;
};

/**
 * Virtualized Column Header that displays headers as they scroll into the given width
 */
const ColumnHeaders = (
  { left, cellWidth, height, width, itemData, treeData, treeNodes, treeNodesMap, onScroll }: ColumnHeadersProps,
  ref: ForwardedRef<any>
): JSX.Element => {

  const { 
    searchedColID, 
    listData, 
    setFilteredGridXData, 
    setVisiableColNodes,
    scrollTreeYIniPos } = itemData;

  const [prevSearched, setPrevSearched] = useState<string | null>(null); // previous searched enrty
  const [expanded, setExpanded] = useState<string[]>([]); // all expanded nodes


  /**
   * styles for tree view and tree items
   */
  // the font size is 14 for this page
  const iconSize = 14;

  // style for the whole tree
  const columnTreeHeadersStyles: CSSProperties = {
    position: 'absolute',
    left: left,
    height: height,
    width: width,
    overflow: 'hidden',
    willChange: 'transform',
    maxHeight: height,
  };

  // Customize the minus square icon for tree view
  const minusSquareIconPath = 'M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365'+
  '-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-'+
  '.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.'+
  '826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z';
  const MinusSquare = (props: SvgIconProps) => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginLeft: 6.5,
          paddingLeft: 2,
          height: (cellWidth-iconSize)/2,
          marginBottom: -5,
          borderLeft: '1px dotted grey'
        }}
      />
      <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
        {/* eslint-disable-next-line max-len */}
        <path d={minusSquareIconPath} />
      </SvgIcon>
      <div
        style={{
          position: 'absolute',
          marginTop: -9,
          marginLeft: 14,
          width: 8,
          borderTop: '1px dotted grey'
        }}
      />
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellWidth-iconSize)/2,
          marginTop: -2,
          borderRight: '1px dotted grey'
        }}
      />
    </div>
  );

  // Customize the plus square icon for tree view
  const plusSquareIconPath = 'M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803'+
  ' 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147'+
  'q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.2'+
  '81t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401'+
  '.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z';
  const PlusSquare = (props: SvgIconProps) => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginLeft: 6.5,
          paddingLeft: 2,
          height: (cellWidth-iconSize)/2,
          marginBottom: -5,
          borderLeft: '1px dotted grey'
        }}
      />
      <SvgIcon fontSize='inherit' style={{ width: 14, height: 14 }} {...props}>
        {/* eslint-disable-next-line max-len */}
        <path d={plusSquareIconPath} />
      </SvgIcon>
      <div
        style={{
          position: 'absolute',
          marginTop: -9,
          marginLeft: 14,
          width: 10,
          borderTop: '1px dotted grey'
        }}
      />
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellWidth-iconSize)/2,
          marginTop: -2,
          borderRight: '1px dotted grey'
        }}
      />
    </div>
  );

  // Customize the close square icon for tree view
  const CloseSquare = () => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginLeft: 16.5,
          paddingLeft: 2,
          height: cellWidth,
          marginTop: -(cellWidth/2),
          borderLeft: '1px dotted grey'
        }}
      />
      <div
        style={{
          marginTop: -(cellWidth/2),
          marginLeft: 18,
          width: 16,
          borderTop: '1px dotted grey'
        }}
      />
    </div>
  );

  /**
   * Interaction functions
   */

  // Check whether all ancestors of a node exist in visitedNode list
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

  // Find all ancestor nodes of the searched node
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

  // Dictionary to store relationship of parent and child for tree data
  const treeDataDict: Record<string, MatrixTreeDatum> = treeData.reduce((dict: Record<string, MatrixTreeDatum>, node: MatrixTreeDatum) => {
    dict[node.child_id] = node;
    return dict;
  }, {});

  // Refresh visiableRowNodes and filteredGridYData whenever expanded nodes change, update previous Searched entry as well
  // This means the header and grid data should sync whenever expanded nodes change
  useEffect(() => {
    const newSet = new Set<string>();
    // Add all top nodes by default
    for (const node of treeNodes) {
      newSet.add(node.key);
    }
    // Check visibility and add all visiable nodes to the set
    const nodesSet: Set<string> = new Set(expanded);
    expanded.forEach(nodeId => {
      const visiable = checkParentChainExist(treeDataDict, nodeId, nodesSet);
      if(visiable){
        const node = treeNodesMap[nodeId];
        if (node) {
          if (node.children.length > 0) {
            for (const child of node.children) {
              newSet.add(child.key);
            }
          }
        }
      }
    });
    setVisiableColNodes(newSet);
    // If there is an update to the searched row entry, then update filteredGridData for locating function
    if( searchedColID && prevSearched !== searchedColID){
      let filteredGridData : ParsedGridCell[] = listData[0];

      if(newSet){
        filteredGridData = listData[0].filter((cell: ParsedGridCell) => newSet.has(cell.column.id));
      }

      setFilteredGridXData(filteredGridData);
      setPrevSearched(searchedColID);
    }
  }, [expanded]);

  // // Refresh the expanded nodes list when search a row
  useEffect(() => {
    if (searchedColID){
      const nodesSet: Set<string> = new Set(expanded);
      const newNodesSet = getParentChain(treeDataDict, searchedColID, nodesSet);
      const newExpanded: string[] = Array.from(newNodesSet);
      setExpanded(newExpanded);
    }
  }, [searchedColID]);

  // // Handle toggle in tree view
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  return (
    <div 
      className='grid-column-headers'
      style={columnTreeHeadersStyles}
      >

      <div 
        style={{ maxHeight: height, overflow: 'auto'}} 
        onScroll={onScroll} 
        ref={ref}>

        <div
        style={{
          transformOrigin: 'top left',
          transform: 'rotate(-90deg)',
          width: height,
          marginLeft: 0,
          marginTop: height,
        }}>

          <TreeView
            aria-label='rich object'
            defaultExpanded={['root']}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            style={{
              height: 'fit-content',
              width: 'fit-content',
              position: 'absolute',
              left: -scrollTreeYIniPos, // Adjust the left value based on the desired position
            }}
            sx={{ overflow: 'clip' }}
          >
            <MemoizedRenderTree
              nodes={treeNodes}
              data={itemData}
              cellWidth={cellWidth}
              treeNodesMap={treeNodesMap}
            />
          </TreeView>

        </div>
        </div>
        
    </div>
  );
};


/**
 * Create a component that renders the tree (the renderTree function) and then memorize it 
 */
type MemoizedRenderTreeProps = {
  nodes: TreeNode[];
  data: any;
  cellWidth: number;
  treeNodesMap: TreeNodeMap;
};

const MemoizedRenderTree = memo(({ nodes, data, cellWidth, treeNodesMap }: MemoizedRenderTreeProps) => {
  const { 
    searchedColID, 
    hoveredColID,
    setHoveredColID,
    setHoveredRowID,
    setHoveredRowIndex } = data;

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
    left: -400,
    width: 1000,
    height: cellWidth,
    zIndex: 0,
  };

  // style for the background of each entry when hover
  const rowTreeItemBgStylesHover: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 1000,
    height: cellWidth,
    zIndex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Grey color with 50% opacity
  };

  // style for the background of each entry when searched
  const rowTreeItemBgStylesSearch: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 1000,
    height: cellWidth,
    zIndex: 0,
    backgroundColor: 'rgba(247, 240, 207, 0.7)', // light yellow color
  };

  // Extends MUI TreeItemProps to implement custom props
  interface CustomTreeItemProps extends TreeItemProps {
    node: TreeNode;
  }

  // Update id or index for when hover an item
  const updateColId = (nodeId: string) => {
    setHoveredColID(nodeId);
    setHoveredRowID(null);
    setHoveredRowIndex(null);
  };

  // Customize tree item so that the link function and expand/collapse function are separate
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

  // Define interaction and style for tree item
  const StyledTreeItem = styled(({ node, ...props }: CustomTreeItemProps) => {
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
  }));


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
          node = {node}
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
