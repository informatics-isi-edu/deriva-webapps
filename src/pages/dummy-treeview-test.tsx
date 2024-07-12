/* eslint-disable react/display-name */
import React, {
  useState,
  useMemo, forwardRef, useRef
} from 'react';
import ChaiseTreeview from '@isrd-isi-edu/deriva-webapps/src/components/chaise-treeview';

import { createRoot } from 'react-dom/client';

import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';

import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import { CustomColTreeItem, CustomRowTreeItem } from '../components/matrix/shared-tree-button';
import { CustomTreeViewItem } from '../components/matrix/tree-view-button';
const dummySettings = {
  appName: 'app/dummy',
  appTitle: 'Dummy',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
  openIframeLinksInTab: true,
};
type properties = {
  homogenous?: Boolean,
  regional?: Boolean,
  restricted?: Boolean
}

interface TreeNodeType {
  id: string;
  label: string;
  labelIconArray?: string[];
  labelInfo?: string;
  children?: TreeNodeType[];
}



const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
  {
    id: 'grid',
    label: 'Data Grid',
    children: [
      { id: 'grid-community', label: '@mui/x-data-grida' },
      { id: 'grid-pro', label: '@mui/x-data-grid-proa' },
      { id: 'grid-premium', label: '@mui/x-data-grid-premiuma' },
    ],
  },
  {
    id: 'pickers',
    label: 'Pickers',
    children: [
      {
        id: 'pickers-community', label: '@mui/x-date-pickers',
        children: [
          { id: 'grid-communitya', label: '@mui/x-data-gridb' },
          { id: 'grid-prob', label: '@mui/x-data-grid-prob' },
          { id: 'grid-premiumc', label: '@mui/x-data-grid-premiumb' }
        ]
      },
      { id: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
    ],
  },
  {
    id: 'charts',
    label: 'Charts',
    children: [{ id: 'charts-community', label: '@mui/x-charts' }],
  },
  {
    id: 'tree-view',
    label: 'Tree View',
    children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }],
  },
];
type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash';


type ExtendedTreeItemProps = {

  labelIconArray?: string[];
  labelInfo?: string;
  id: string;
  label: React.ReactNode;
};

const ITEMS: TreeViewBaseItem<ExtendedTreeItemProps>[] = [
  {
    id: '1',
    label: 'Documents',
    children: [
      {
        id: '1.1',
        label: 'Company',
        children: [
          { id: '1.1.1', label: 'Invoice' },
          { id: '1.1.2', label: 'Meeting notes', },
          { id: '1.1.3', label: 'Tasks list', },
          { id: '1.1.4', label: 'Equipment', },
          { id: '1.1.5', label: 'Video conference', },
        ],
      },
      { id: '1.2', label: 'Personal', },
      { id: '1.3', label: 'Group photo', },
    ],
    labelIconArray: ['homogenous', 'graded']
  },
  {
    id: '2',
    label: 'Bookmarked',
    children: [
      { id: '2.1', label: 'Learning materials' },
      { id: '2.2', label: 'News' },
      { id: '2.3', label: 'Forums',
        children: [
        { id: '2.11', label: 'Lear' },
        { id: '2.21', label: 'Ne' },
        { id: '2.31', label: 'Forum' },
        { id: '2.41', label: 'Compan' },
      ] },
      { id: '2.4', label: 'Travel documents' },
    ],
  },
  { id: '3', label: 'History' },
  { id: '4', label: 'Trash' },
];
const getTreeItemComponent = (item: any) => {
  if (item.isRow) return CustomRowTreeItem;
  if (item.isTreeview) return CustomTreeViewItem;
  return CustomColTreeItem;
};
// Check if label can be something other than text, -> link, html element?, one label italic?
// chaisetreeview handles right left and top expansion
const App = forwardRef((props, ref) => {
  return (
    <>
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{
          height: '33vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'right',
          marginTop: 250
        }}>
          <ChaiseTreeview mui_x_product={[...MUI_X_PRODUCTS]} nodeType={CustomColTreeItem} expandDirection={'top'}/>
        </div>

        <div style={{
          height: '33vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'right',
          overflow: 'auto'  // Ensures any overflow content is scrollable
        }}>
          <ChaiseTreeview mui_x_product={[...MUI_X_PRODUCTS]} nodeType={CustomRowTreeItem} expandDirection={'left'} />
        </div>
        <div style={{
          height: '33vh',
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'auto'  // Ensures any overflow content is scrollable
        }}>
          <ChaiseTreeview mui_x_product={[...ITEMS]} nodeType={CustomTreeViewItem} expandDirection={'right'} />
        </div>
      </div>
    </>
  );
});

const rootElement = document.getElementById(ID_NAMES.APP_ROOT);
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <AppWrapper appSettings={dummySettings}>
      <App ref={ref => { /* Use the ref here if needed */ }} />
    </AppWrapper>
  );
}



