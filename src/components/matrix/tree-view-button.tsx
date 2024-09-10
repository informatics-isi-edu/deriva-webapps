/* eslint-disable no-restricted-imports */

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
  unstable_useTreeItem2 as useTreeItem2,
  UseTreeItem2Parameters
} from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { groupTransitionStyle } from '@isrd-isi-edu/deriva-webapps/src/components/chaise-treeview';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import icon1 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png';
import icon2 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png';
import icon3 from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png';
import { Link } from '@mui/material';

import Avatar from '@mui/material/Avatar';
import camera_icon from '@isrd-isi-edu/deriva-webapps/treeview/resources/images/camera-icon.png';
import AvatarModal from './avatar-modal';

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
  label: string;
}

const CustomTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  // marginBottom: theme.spacing(0.3),
  color: theme.palette.text.secondary,

  paddingRight: theme.spacing(1),
  fontWeight: theme.typography.fontWeightMedium,
  padding: '0px!important',
  gap: '0px!important',
  '&.expanded': {
    fontWeight: theme.typography.fontWeightRegular,
  },
  '&:hover': {
    backgroundColor: 'white',
  },
  // change here to update color on focused and selected
  '&.focused, &.selected, &.selected.focused': {
    backgroundColor: 'white',
    color: 'var(--tree-view-color)',
  },
}));

const CustomTreeItemIconContainer = styled(TreeItem2IconContainer)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

const CustomTreeItemGroupTransition = styled(TreeItem2GroupTransition)(
  ({ theme }) => ({
    marginLeft: 9,
    paddingLeft: 18,
    borderLeft: '1px dotted grey',
    [`& .${treeItemClasses.content}`]: {
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      '& .close': {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.groupTransition}`]: {},
  }),
);


export const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: StyledTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const theme = useTheme();
  const {
    id,
    label,
    children,
    bgColor,
    color,
    colorForDarkMode,
    bgColorForDarkMode,
    itemId,
    disabled,
    ...other
  } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });
  console.log(publicAPI.getItem(itemId));
  const style = {
    '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
    '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
  };

  interface IconMap {
    [key: string]: string;
  }

  const iconMap: IconMap = {
    Homogeneous: icon1,
    Graded: icon2,
    SingleCell: icon3,
  };


  return (
    <CustomTreeItemRoot {...getRootProps({ ...other, style })}>
      <CustomTreeItemContent
        {...getContentProps({
          className: clsx('content', {
            expanded: status.expanded,
            selected: status.selected,
            focused: status.focused
          }),
        })}
      >
        <CustomTreeItemIconContainer {...getIconContainerProps()} sx={{ marginRight: 0, zIndex: 10 }}>
          <TreeItem2Icon status={status} />
        </CustomTreeItemIconContainer>
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            p: 0.5,
            pr: 0,
            marginLeft: '-30px',
            paddingBottom: 0
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            {publicAPI.getItem(itemId).lastChild === true? <>
              <div
                style={{
                  marginLeft: '18.5px',
                  paddingLeft: '2px',
                  height: '12.5px',
                  marginTop: '-12.5px',
                  borderLeft: '1px dotted grey',
                }}
              ></div>
              <div
                style={{
                  marginLeft: '18px',
                  width: '16px',
                  borderTop: '1px dotted grey',
                }}
              ></div></> : <>
              <div
                style={{
                  marginLeft: '18.5px',
                  paddingLeft: '2px',
                  height: '25px',
                  marginTop: '-12.5px',
                  borderLeft: '1px dotted grey',
                }}
              ></div>
              <div
                style={{
                  marginTop: '-12.5px',
                  marginLeft: '18px',
                  width: '16px',
                  borderTop: '1px dotted grey',
                }}
              ></div>
            </>}
          </div>
          <Typography
            {...getLabelProps({
              variant: 'body2',
              sx: {
                display: 'contents',
                fontSize: '14px',
                fontWeight: '200',
                flexGrow: 1,

              },
            })}
          >
            <Link href={'https://www.atlas-d2k.org/chaise/record/#2/Vocabulary:Anatomy/RID=14-4QE8'} color="inherit">
              {label}
            </Link>
          </Typography>
          {publicAPI.getItem(itemId).labelIconArray?.map((label: any, index: any) => (
            <Avatar key={index} src={iconMap[label]} sx={{ width: 16, height: 16 }} alt={label} />
          ))}
          <AvatarModal icon1={camera_icon} labelTitle={label as string} />
        </Box>
      </CustomTreeItemContent>
      {children && (
        <CustomTreeItemGroupTransition {...getGroupTransitionProps()} />
      )}
    </CustomTreeItemRoot>
  );
});

export const CustomTreeViewItem = styled(CustomTreeItem)(({ theme }) => ({
  color: theme.palette.mode === 'light' ? theme.palette.grey[800] : theme.palette.grey[200],
  [`& .${treeItemClasses.content}`]: {
    // padding: theme.spacing(0.5, 1),
    gap: '0px!important',
    [`& .${treeItemClasses.label}`]: {
      fontSize: '0.8rem',
      fontWeight: 500,
      fontFamily: 'inherit'
    },
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.main, 0.25)
      : theme.palette.primary.dark,
    color: theme.palette.mode === 'dark' && theme.palette.primary.contrastText,
  },
  [`& .${treeItemClasses.groupTransition}`]: groupTransitionStyle(theme),
}));
