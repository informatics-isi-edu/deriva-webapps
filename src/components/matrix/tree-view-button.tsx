import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import {
  unstable_useTreeItem2 as useTreeItem2,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view/useTreeItem2';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2GroupTransition,
  TreeItem2Label,
  TreeItem2Root,
} from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import icon1 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png';
import icon2 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png';
import icon3 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png';

import camera_icon from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/camera-icon.png';
import AvatarModal from './avatar-modal';
const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  '.css-1qioken-MuiTreeItem2-label': {
    width: 'fit-content',
  },
}));

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

export const CustomTreeViewItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  // Function to determine which icon to use
  const getIcon = (label: string) => {
    if (label.includes('Homogeneous')) return icon1;
    if (label.includes('Graded')) return icon2;
    if (label.includes('SingleCell')) return icon3;
    return null;
  };

  const icon = getIcon(label as string);

  return (
    <TreeItem2Root {...getRootProps(other)}>
      <CustomTreeItemContent {...getContentProps()}>
        <TreeItem2IconContainer {...getIconContainerProps()}>
          <TreeItem2Icon status={status} />
        </TreeItem2IconContainer>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, alignItems: 'center' }}>

          <TreeItem2Label {...getLabelProps()} />
          {icon1 && <Avatar src={icon1} sx={{ width: 24, height: 24 }}/>}
          <AvatarModal icon1={camera_icon} labelTitle={label as string}/>
        </Box>
      </CustomTreeItemContent>
      {children && <TreeItem2GroupTransition {...getGroupTransitionProps()} />}
    </TreeItem2Root>
  );
});
