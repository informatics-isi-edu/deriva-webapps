/* eslint-disable no-restricted-imports */
import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_treeview-app.scss';

import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import TreeviewContainer from '@isrd-isi-edu/deriva-webapps/src/components/treeview/treeview-containter';

import { CustomRowTreeItem, CustomColTreeItem } from '../components/matrix/shared-tree-button';
import { CustomTreeViewItem } from '../components/matrix/tree-view-button';
// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
// import LegacyTreeViewApp from '@isrd-isi-edu/deriva-webapps/src/components/treeview/legacy-treeview';
import transformTree from '../components/treeview/convert-to-valid-tree';
import treeData from '../components/treeview/tree-data.json';

const transformedData = transformTree(treeData);
const outputContent = `export const treeData = ${JSON.stringify(transformedData, null, 2)};`;

// Log the transformed data
console.log('Transformation complete. The transformed data is:');
console.log(outputContent);

import { TreeViewBaseItem } from '@mui/x-tree-view/models';
const MUI_X_PRODUCTS: TreeViewBaseItem[] = transformedData;
// const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
//   {
//     id: 'grid',
//     label: 'Data Grid',
//     children: [
//       { id: 'grid-community', label: '@mui/x-data-grida' },
//       { id: 'grid-pro', label: '@mui/x-data-grid-proa' },
//       { id: 'grid-premium', label: '@mui/x-data-grid-premiuma' },
//     ],
//   },
//   {
//     id: 'pickers',
//     label: 'Pickers',
//     children: [
//       {
//         id: 'pickers-community', label: '@mui/x-date-pickers',
//         children: [
//           { id: 'grid-communitya', label: '@mui/x-data-gridb' },
//           { id: 'grid-prob', label: '@mui/x-data-grid-prob' },
//           { id: 'grid-premiumc', label: '@mui/x-data-grid-premiumb' }
//         ]
//       },
//       { id: 'pickers-pro', label: '@mui/x-date-pickers-pro' },
//     ],
//   },
//   {
//     id: 'charts',
//     label: 'Charts',
//     children: [{ id: 'charts-community', label: '@mui/x-charts' }],
//   },
//   {
//     id: 'tree-view',
//     label: 'Tree View',
//     children: [{ id: 'tree-view-community', label: '@mui/x-tree-view' }],
//   },
// ];
const treeviewSettings = {
  appName: 'app/treeview',
  appTitle: 'Treeview',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const TreeviewApp = (): JSX.Element => {
  return (
    <TreeviewContainer mui_x_product={[...MUI_X_PRODUCTS]} nodeType={CustomTreeViewItem} expandDirection={'right'}/>
    // <LegacyTreeViewApp/>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  // TODO dontFetchSession should be removed before merging with master
  <AppWrapper appSettings={treeviewSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts dontFetchSession>
    <TreeviewApp />
  </AppWrapper>
);
