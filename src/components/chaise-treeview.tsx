import React, { forwardRef } from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { MemoizedMinusSquare, MemoizedPlusSquare, MemoizedCloseSquare, MemoizedRenderTree } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/tree-button';
import { RowHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row-tree-headers';
import { RefAttributes } from 'react';
import { ColumnHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/column-tree-headers';

import { getScrollbarSize } from '@isrd-isi-edu/deriva-webapps/src/utils/ui-utils';

type ChaiseTreeviewProps = {
  className: string;
  expanded: string[]; // All expanded nodes
  onNodeToggle: (event: React.SyntheticEvent, nodeIds: string[]) => void; // Callback for node toggle
  props: RowHeadersProps | ColumnHeadersProps;
  scrollableDimension: number;
  isScrolling: boolean;
} & RefAttributes<HTMLUListElement>; // Adjusted to match the expected type

const iconSize = 14;
// eslint-disable-next-line react/display-name
const ChaiseTreeview = forwardRef<HTMLUListElement, ChaiseTreeviewProps>(({
  className,
  expanded,
  onNodeToggle,
  props,
  scrollableDimension,
  isScrolling
}, ref) => {
// Using logical OR operator to select non-null/undefined value
  const sizeOfCell = props?.cellHeight || props?.cellWidth;
  const isLeft = className === 'grid-column-headers-treeview' ? true : false;
  const isColumn = isLeft;

  return (
    <TreeView
      className= {className}
      aria-label='rich object'
      defaultExpanded={['root']}
      defaultCollapseIcon={<MemoizedMinusSquare isLeft={isLeft} cellSize={sizeOfCell} iconSize={iconSize} />}
      defaultExpandIcon={<MemoizedPlusSquare isLeft={isLeft} cellSize={sizeOfCell} iconSize={iconSize} />}
      defaultEndIcon={<MemoizedCloseSquare isLeft={isLeft} cellSize={sizeOfCell} />}
      expanded={expanded}
      onNodeToggle={onNodeToggle}
      ref={ref}
      style={ className === 'grid-column-headers-treeview' ? { position: 'absolute', left: -scrollableDimension, 
      paddingBottom: props.cellWidth + getScrollbarSize('.grid'),} : {}}
      sx={className === 'grid-column-headers-treeview'  ? { overflow: 'clip' } : {}} 
    >
      {/* pass component and children */}
      {/* decouple tree-button */}
      <MemoizedRenderTree
        nodes={props.treeNodes}
        data={props.itemData}
        cellSize={sizeOfCell}
        treeNodesMap={props.treeNodesMap}
        isScrolling={isScrolling}
        scrollableSize={scrollableDimension}
        isColumn={isColumn} />
    </TreeView>
  );
});

export default ChaiseTreeview;
