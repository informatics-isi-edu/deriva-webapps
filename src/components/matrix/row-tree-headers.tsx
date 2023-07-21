import { forwardRef, memo, ForwardedRef, CSSProperties, useState, useEffect } from 'react';

import { ParsedGridCell } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { MatrixTreeDatum } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// MUI tree components
import TreeView from "@mui/lab/TreeView";
import { alpha, styled } from "@mui/material/styles";
import TreeItem, { TreeItemProps, treeItemClasses, useTreeItem, TreeItemContentProps } from "@mui/lab/TreeItem";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import clsx from "clsx";
import Typography from "@mui/material/Typography";


type RowTreeHeadersProps = {
  /**
   * top position of row headers
   */
  top: number;
  /**
   * height of grid cell
   */
  cellHeight: number;
  /**
   * width of grid cell
   */
  cellWidth: number;
  /**
   * each row width
   */
  width: number;
  /**
   * overall height
   */
  height: number;
  /**
   * number of rows
   */
  itemCount: number;
  /**
   *  data passed to each row
   */
  itemData?: any;
  /**
  *  y hierarchical data passed to each row
  */
  treeData?: any;
  /**
   *  y hierarchical data nodes passed to each row
   */
  treeNodes?: any;
  /**
   *  y hierarchical data nodes map passed to each row
   */
  treeNodesMap?: any;
  /**
   * on scroll event
   */
  onScroll?: any;
};

/**
 * Virtualized row Header that displays headers as they scroll into the given height
 */
const RowTreeHeaders = (
  { top, width, cellHeight, height, itemData, treeData, treeNodes, treeNodesMap, onScroll }: RowTreeHeadersProps,
  ref: ForwardedRef<any>
): JSX.Element => {
  const { 
    searchedRowID, 
    listData, 
    setFilteredGridYData, 
    setVisiableRowNodes, 
    hoveredRowID, 
    setHoveredRowID, 
    setHoveredColID } = itemData;

  const [prevSearched, setPrevSearched] = useState<string | null>(null); // previous searched enrty
  const [expanded, setExpanded] = useState<string[]>([]); // all expanded nodes

  /**
   * styles for tree view and tree items
   */
  const iconSize = 14;

  const rowTreeHeadersStyles: CSSProperties = {
    position: 'absolute',
    direction: "rtl",
    top: top,
    height: height,
    width: width,
    overflow: 'auto',
    willChange: 'transform',
  };

  const rowTreeItemOuterBgStyles: CSSProperties = {
    position: 'relative',
    top: 0,
    left: -50,
  };

  const rowTreeItemBgStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 1000,
    height: cellHeight,
    zIndex: 0,
  };

  const rowTreeItemBgStylesHover: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 1000,
    height: cellHeight,
    zIndex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Grey color with 50% opacity
  };

  const rowTreeItemBgStylesSearch: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: -400,
    width: 1000,
    height: cellHeight,
    zIndex: 0,
    backgroundColor: 'rgba(247, 240, 207, 0.7)', // light yellow color
  };

  // Customize the minus square icon for tree view
  const MinusSquare = (props: SvgIconProps) => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellHeight-iconSize)/2,
          marginBottom: -5,
          borderRight: `1px dotted grey`
        }}
      />
      <SvgIcon fontSize="inherit" style={{ width: iconSize, height: iconSize, zIndex: 1 }} {...props}>
        {/* tslint:disable-next-line: max-line-length */}
        <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
      </SvgIcon>
      <div
        style={{
          position: "absolute",
          marginTop: -9,
          marginRight: 17,
          width: 8,
          borderTop: `1px dotted grey`
        }}
      />
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellHeight-iconSize)/2,
          marginTop: -2,
          borderRight: `1px dotted grey`
        }}
      />
    </div>
  );
  
  // Customize the plus square icon for tree view
  const PlusSquare = (props: SvgIconProps) => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellHeight-iconSize)/2,
          marginBottom: -5,
          borderRight: `1px dotted grey`
        }}
      />
      <SvgIcon fontSize="inherit" style={{ width: iconSize, height: iconSize }} {...props}>
        {/* tslint:disable-next-line: max-line-length */}
        <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
      </SvgIcon>
      <div
        style={{
          position: "absolute",
          marginTop: -9,
          marginRight: 14,
          width: 10,
          borderTop: `1px dotted grey`
        }}
      />
      <div
        style={{
          marginRight: 6.5,
          paddingRight: 2,
          height: (cellHeight-iconSize)/2,
          marginTop: -2,
          borderRight: `1px dotted grey`
        }}
      />
    </div>
  );
  
  // Customize the close square icon for tree view
  const CloseSquare = (props: SvgIconProps) => (
    <div style={{ zIndex: 1 }}>
      <div
        style={{
          marginRight: 16.5,
          paddingRight: 2,
          height: cellHeight,
          marginTop: -(cellHeight/2),
          borderRight: `1px dotted grey`
        }}
      />
      <div
        style={{
          marginTop: -(cellHeight/2),
          marginRight: 18,
          width: 16,
          borderTop: `1px dotted grey`
        }}
      />
    </div>
  );

  // Tree node type for render tree view
  interface RenderTree {
    key: string;
    title: string;
    link: string;
    children?: readonly RenderTree[];
  }

  // Extends MUI TreeItemProps to implement custom props
  interface CustomTreeItemProps extends TreeItemProps {
    node: RenderTree;
  }

  const updateRowId = (nodeId: String) => {
    setHoveredColID(null);
    setHoveredRowID(nodeId);
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

    let linkClassName = nodeId === hoveredRowID ? 'hovered-header' : 'unhovered-header';

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={clsx(className, classes.root, {
          [classes.expanded]: expanded,
          [classes.selected]: selected,
          [classes.focused]: focused,
          [classes.disabled]: disabled
        })}
        onMouseDown={handleMouseDown}
        onMouseOver={() => updateRowId(nodeId)}
        ref={ref as React.Ref<HTMLDivElement>}
      >
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div onClick={handleExpansionClick} className={classes.iconContainer}>
          {icon}
        </div>
        <Typography
          onClick={handleSelectionClick}
          component="div"
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

  // Define tree item including interaction and style
  const StyledTreeItem = styled(({ node, ...props }: CustomTreeItemProps) => {
    // Check if the node key matches the hovered row id
    const isNodeKeyMatched = node.key === hoveredRowID;
    // Check if the node key matches the searched row id
    const isNodeKeyMatchedSearch = node.key === searchedRowID;

    return (
      <div>
        {/* Element before TreeItem */}
        <div className="hoverBackground" style={rowTreeItemOuterBgStyles} onMouseOver={() => updateRowId(node.key)}>
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
      "& .close": {
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

      '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused, &.Mui-expanded.Mui-selected.Mui-focused, &.Mui-expanded.Mui-selected, &.Mui-expanded.Mui-focused': {
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
    },
  }));


  /**
   * Render the tree view layer by layer with nodes input
   */
  const renderTree = (nodes: RenderTree[]): JSX.Element[] => {
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
  const treeDataDict: Record<string, MatrixTreeDatum> = treeData.reduce((dict: any, node: any) => {
    dict[node.child_id] = node;
    return dict;
  }, {});

  // Refresh visiableRowNodes and filteredGridYData whenever expanded nodes change, update previous Searched entry as well
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
    setVisiableRowNodes(newSet);
    // If there is an update to the searched row entry, then update filteredGridData for locating function
    if( searchedRowID && prevSearched !== searchedRowID){
      var filteredGridData : ParsedGridCell[][] = listData;
      var numRows = listData.length;
      const lastRow: ParsedGridCell[] = listData[numRows-1]; // Store a copy of the last row
      if(newSet){
        filteredGridData = listData.filter((gridRow : ParsedGridCell[]) => {
          return gridRow.some((cell) => newSet.has(cell.row.id));
        });
      }
      filteredGridData.push(lastRow);
      setFilteredGridYData(filteredGridData);
      setPrevSearched(searchedRowID);
    }
  }, [expanded]);

  // Refresh the expanded nodes list when search a row
  useEffect(() => {
    if (searchedRowID){
      const nodesSet: Set<string> = new Set(expanded);
      const newNodesSet = getParentChain(treeDataDict, searchedRowID, nodesSet);
      const newExpanded: string[] = Array.from(newNodesSet);
      setExpanded(newExpanded);
    }
  }, [searchedRowID]);

  // Handle toggle in tree view
  const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  return (
    <div 
      className='grid-row-headers'
      style={rowTreeHeadersStyles}
      ref={ref}
      onScroll={onScroll}>
      
          <TreeView
            aria-label="rich object"
            defaultExpanded={["root"]}
            defaultCollapseIcon={<MinusSquare />}
            defaultExpandIcon={<PlusSquare />}
            defaultEndIcon={<CloseSquare />}
            expanded={expanded}
            onNodeToggle={handleToggle}
          >
            {renderTree(treeNodes)}
          </TreeView>
          
    </div>
  );
};

export default memo(forwardRef(RowTreeHeaders));
