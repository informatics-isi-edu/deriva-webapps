import * as React from 'react';
import clsx from 'clsx';
import { styled, useTheme, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Root,
  TreeItem2GroupTransition,
} from '@mui/x-tree-view/TreeItem2';
import {
  unstable_useTreeItem2 as useTreeItem,
  UseTreeItem2Parameters,
} from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { treeItemClasses } from '@mui/x-tree-view';
declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

interface StyledTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
  React.HTMLAttributes<HTMLLIElement> {
  bgColor?: string;
  bgColorForDarkMode?: string;
  color?: string;
  colorForDarkMode?: string;
  labelIconArray?: string[];
  labelInfo?: string;
}

const CustomTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  marginBottom: theme.spacing(0.3),
  color: theme.palette.text.secondary,
  paddingRight: theme.spacing(1),
  fontWeight: theme.typography.fontWeightMedium,
  '&.expanded': {
    fontWeight: theme.typography.fontWeightRegular,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.focused, &.selected, &.selected.focused': {
    backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
    color: 'var(--tree-view-color)',
  },
}));

const CustomTreeItemIconContainer = styled(TreeItem2IconContainer)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const CustomTreeItemGroupTransition = styled(TreeItem2GroupTransition)(
  ({ theme }) => ({
    
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    ['& .content']: {
      paddingLeft: theme.spacing(2),
      // borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
    [`& .${treeItemClasses.content}`]: {
      padding: theme.spacing(0.5, 1),
      margin: theme.spacing(0.2, 0),
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      '& .close': {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.groupTransition}`]: {
    },
  }),
);

export const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: StyledTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const theme = useTheme();
  const {
    id,
    itemId,
    label,
    disabled,
    children,
    bgColor,
    color,
    labelIconArray: labelIconArray,
    labelInfo,
    colorForDarkMode,
    bgColorForDarkMode,
    ...other
  } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const style = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color':
      theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  return (
    <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
      <CustomTreeItemContent
        {...getContentProps({
          className: clsx('content', {
            expanded: status.expanded,
            selected: status.selected,
            focused: status.focused,
          }),
        })}
      >
        <CustomTreeItemIconContainer {...getIconContainerProps()}>
          <TreeItem2Icon status={status} />
        </CustomTreeItemIconContainer>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >

          <Typography
            {...getLabelProps({
              variant: 'body2',
              sx: { display: 'contents', 
              fontWeight: labelIconArray && labelIconArray.length !== 0 ? 'bold' : 'inherit', flexGrow: 1 },
            })}
          />
          <Typography variant='caption' color='inherit'>
            {labelInfo}
          </Typography>
          {labelIconArray?.map((icon, index) => (
            <img key={index} src={icon} alt={`Icon ${index + 1}`} />
          ))}
        </Box>
      </CustomTreeItemContent>
      {children && (
        <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />
      )}
    </CustomTreeItemRoot>
  );
});