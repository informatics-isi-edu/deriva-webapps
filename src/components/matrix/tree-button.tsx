import { memo, CSSProperties, forwardRef } from 'react';

// Data type used for treeview
import { TreeNode } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';
import { TreeNodeMap } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

// MUI tree components
import { alpha, styled } from '@mui/material/styles';
import { TreeItem, TreeItemProps, treeItemClasses, useTreeItemState, TreeItemContentProps } from '@mui/x-tree-view/TreeItem';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';


/**
 * Create a component that customizes the minus square icon for tree view and then memorize it
 */
type MemoizedIconSquareProps = {
  isLeft: boolean; // True when the tree expands from left to right, False when right to left
  cellSize: number; // Cell width or height, depends on the header is row or column
  iconSize: number; // The font size in the page, used to calculated the middle position of the icon
};

export const MemoizedMinusSquare = memo(({ isLeft, cellSize, iconSize }: MemoizedIconSquareProps) => {
  const firstHalfBorderStyle = isLeft
    ? {
        marginLeft: 5.5,
        paddingLeft: 2,
        height: (cellSize - iconSize) / 2,
        marginBottom: -3,
        borderLeft: '1px dotted grey',
    }
    : {
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellSize - iconSize) / 2,
        marginBottom: -3,
        borderRight: '1px dotted grey'
    };

  const middleBorderStyle: CSSProperties = isLeft
    ? {
        position: 'absolute',
        marginTop: -11,
        marginLeft: 13,
        width: 10,
        borderTop: '1px dotted grey'
    }
    : {
        position: 'absolute',
        marginTop: -11,
        marginRight: 13,
        width: 10,
        borderTop: '1px dotted grey'
    };

  const secondHalfBorderStyle =
    {
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellSize - iconSize) / 2,
        marginTop: -3,
        borderRight: '1px dotted grey'
    };

  return (
    <div style={{ zIndex: 1 }}>
      <div
        style={firstHalfBorderStyle}
      />
      <i className='fa-regular fa-square-minus'></i>
      <div
        style={middleBorderStyle}
      />
      <div
        style={secondHalfBorderStyle}
      />
    </div>
  );
});

// Add displayName to the functional component
MemoizedMinusSquare.displayName = 'MemoizedMinusSquare';

/**
 * Create a component that customizes the plus square icon for tree view and then memorize it
 */
export const MemoizedPlusSquare = memo(({ isLeft, cellSize, iconSize }: MemoizedIconSquareProps) => {
  const firstHalfBorderStyle = isLeft
    ? {
        marginLeft: 5.5,
        paddingLeft: 2,
        height: (cellSize - iconSize) / 2,
        marginBottom: -3,
        borderLeft: '1px dotted grey',
        }
    : {
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellSize - iconSize) / 2,
        marginBottom: -3,
        borderRight: '1px dotted grey'
    };

  const middleBorderStyle: CSSProperties = isLeft
    ? {
        position: 'absolute',
        marginTop: -11,
        marginLeft: 13,
        width: 10,
        borderTop: '1px dotted grey'
      }
    : {
        position: 'absolute',
        marginTop: -11,
        marginRight: 13,
        width: 10,
        borderTop: '1px dotted grey'
    };

  const secondHalfBorderStyle =
    {
        marginRight: 5.5,
        paddingRight: 2,
        height: (cellSize - iconSize) / 2,
        marginTop: -3,
        borderRight: '1px dotted grey'
    };

  return (
    <div style={{ zIndex: 1 }}>
      <div
        style={firstHalfBorderStyle}
      />
        <i className='fa-regular fa-square-plus'></i>
      <div
        style={middleBorderStyle}
      />
      <div
        style={secondHalfBorderStyle}
      />
    </div>
  );
});
// Add displayName to the functional component
MemoizedPlusSquare.displayName = 'MemoizedPlusSquare';


/**
 * Create a component that customizes the close square icon for tree view and then memorize it
 */
type MemoizedCloseSquareProps = {
  isLeft: boolean; // True when the tree expands from left to right, False when right to left
  cellSize: number; // Cell width or height, depends on the header is row or column
};

export const MemoizedCloseSquare = memo(({ isLeft, cellSize }: MemoizedCloseSquareProps) => {
  const longBorderStyle = isLeft
    ? {
        marginLeft: 16.5,
        paddingLeft: 2,
        height: cellSize,
        marginTop: -(cellSize / 2),
        borderLeft: '1px dotted grey'
      }
    : {
        marginRight: 16.5,
        paddingRight: 2,
        height: cellSize,
        marginTop: -(cellSize / 2),
        borderRight: '1px dotted grey'
    };

  const shortBorderStyle = isLeft
    ? {
        marginTop: -(cellSize / 2),
        marginLeft: 18,
        width: 16,
        borderTop: '1px dotted grey'
      }
    : {
        marginTop: -(cellSize / 2),
        marginRight: 18,
        width: 16,
        borderTop: '1px dotted grey'
    };

  return (
    <div style={{ zIndex: 1 }}>
      <div
        style={longBorderStyle}
      />
      <div
        style={shortBorderStyle}
      />
    </div>
  );
});
// Add displayName to the functional component
MemoizedCloseSquare.displayName = 'MemoizedCloseSquare';


/**
 * Create a component that renders the tree (the renderTree function) and then memorize it
 */
type MemoizedRenderTreeProps = {
  nodes: TreeNode[]; // tree nodes data
  data: any; // related to hover and search function
  cellSize: number; // cell height or width
  treeNodesMap: TreeNodeMap; // tree nodes map
  isScrolling: boolean; // whether user is scrolling the header
  scrollableSize: number; // the maximun size of scrollable content
  isColumn: boolean; // whether the header is column header or row header
};

export const MemoizedRenderTree = memo(({ nodes, data, cellSize, treeNodesMap, isScrolling, scrollableSize, isColumn }: MemoizedRenderTreeProps) => {

  let searchedRowID: string, hoveredRowID: string, searchedColID: string, hoveredColID: string, setHoveredRowID: any, setHoveredColID: any;

  if (isColumn) {
    // When it is column header
    ({
      searchedColID,
      hoveredColID,
      setHoveredColID,
      setHoveredRowID,
    } = data);
  } else {
    // When it is row header
    ({
      searchedRowID,
      hoveredRowID,
      setHoveredRowID,
      setHoveredColID,
    } = data);
  }

  /**
   * TODO
   *
   * Only for row tree headers, when scrollableMaxWidth is auto,
   * the hover effect for each entry not in the top layer leaves some blank at the very left
   * because of the indent of the original MUI tree component.
   *
   * Current solution is that, when scrollableMaxWidth is not auto, we set the hover background to the very left
   * of each item, this looks normal since the scrollabel max width is fixed. However, this does not work when
   * scrollableMaxWidth is auto since the background dom will extend the left side and cause a big area of blank
   * In the future, improve the solution or try other solutions.
   */
  const bgLeftPosition = isColumn ? -scrollableSize : 0;
  const bgwidth = isColumn ? 3 * scrollableSize : 2 * scrollableSize;

  // style for the background of each entry
  const treeItemOuterBgStyles: CSSProperties = isColumn
    ? {
      position: 'relative',
      top: 0,
      left: -50,
    }
    : {
      position: 'relative',
      top: 0,
      left: 0,
    };

  // style for each entry
  const treeItemBgStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: bgLeftPosition,
    width: bgwidth,
    height: cellSize,
    zIndex: 0,
  };

  // style for the background of each entry when hover
  const treeItemBgStylesHover: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: bgLeftPosition,
    width: bgwidth,
    height: cellSize,
    zIndex: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Grey color with 50% opacity
  };

  // style for the background of each entry when searched
  const treeItemBgStylesSearch: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: bgLeftPosition,
    width: bgwidth,
    height: cellSize,
    zIndex: 0,
    backgroundColor: 'rgba(247, 240, 207, 0.7)', // light yellow color
  };

  // Extends MUI TreeItemProps to implement custom props
  interface CustomTreeItemProps extends TreeItemProps {
    node: TreeNode;
  }

  /**
   * Update id or index for when hover an item (row header)
   */
  const updateRowId = (itemId: string) => {
    if (!isScrolling) {
      setHoveredColID(null);
      setHoveredRowID(itemId);
    }
  };

  /**
   * Update id or index for when hover an item (column header)
   */
  const updateColId = (itemId: string) => {
    if (!isScrolling) {
      setHoveredColID(itemId);
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
      itemId,
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
    } = useTreeItemState(itemId);

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

    const link = treeNodesMap[itemId]?.link;

    const hover = isColumn ? itemId === hoveredColID : itemId === hoveredRowID
    const linkClassName = hover ? 'hovered-header' : 'unhovered-header';

    const onMouseEnterHandler = isColumn
      ? () => updateColId(itemId)
      : () => updateRowId(itemId);

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
        onMouseEnter={onMouseEnterHandler}
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
    const hoveredID = isColumn ? hoveredColID : hoveredRowID;
    const isNodeKeyMatched = node.key === hoveredID;
    // Check if the node key matches the searched row id
    const searchedID = isColumn ? searchedColID : searchedRowID;
    const isNodeKeyMatchedSearch = node.key === searchedID;

    const onMouseEnterHandler = isColumn
      ? () => updateColId(node.key)
      : () => updateRowId(node.key);

    return (
      <div>
        {/* Element before TreeItem to show the interaction background */}
        <div className='hoverBackground' style={treeItemOuterBgStyles} onMouseEnter={onMouseEnterHandler}>
          <div
            style={
              isNodeKeyMatchedSearch
                ? treeItemBgStylesSearch
                : isNodeKeyMatched
                  ? treeItemBgStylesHover
                  : treeItemBgStyles
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
    [`& .${treeItemClasses.groupTransition}`]: isColumn
    ? {
      marginLeft: 15,
      paddingLeft: 4,
      borderLeft: `1px dotted ${alpha(theme.palette.text.primary, 0.4)}`
      }
    : {
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
      height: cellSize,

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
        itemId={node.key}
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
