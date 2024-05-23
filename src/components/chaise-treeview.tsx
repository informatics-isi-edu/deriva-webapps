/* eslint-disable max-len */
/* eslint-disable no-restricted-imports */
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';

import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
// path to be corrected for lint 
import { CustomTreeItem } from './matrix/shared-tree-button';
import icon1 from '../../treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png';
import icon2 from '../../treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png';
import icon3 from '../../treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png';
import icon4 from '../../treeview/resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png';
declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}
interface TreeNodeProps {
  node: TreeNodeType;
}

interface TreeNodeType {
  itemId: string;
  label: string;
  labelIconArray?: string[];
  labelInfo?: string;
  color?: string;
  bgColor?: string;
  colorForDarkMode?: string;
  bgColorForDarkMode?: string;
  children?: TreeNodeType[];
}
// Potentially abstract treenode more to then facilitate difference between matrix and treeview nodes
// At the shared-tree-button level we could have nodes with only expand collapse
// and have another layer to show icons based on info
const TreeNode: React.FC<TreeNodeProps> = ({ node }) => {
  return (
    <CustomTreeItem
      itemId={node.itemId}
      label={node.label}
      labelIconArray={node?.labelIconArray}
      labelInfo={node.labelInfo}
      color={node.color}
      bgColor={node.bgColor}
      colorForDarkMode={node.colorForDarkMode}
      bgColorForDarkMode={node.bgColorForDarkMode}
    >
      {node.children && node.children.map(childNode => <TreeNode key={childNode.itemId} node={childNode} />)}
    </CustomTreeItem>
  );
};
function ExpandIcon(props: React.PropsWithoutRef<typeof AddBoxRoundedIcon>) {
  return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function CollapseIcon(
  props: React.PropsWithoutRef<typeof IndeterminateCheckBoxRoundedIcon>,
) {
  return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

const treeData = [
  { itemId: '1', label: 'All Mail' },
  { itemId: '2', label: 'Trash', labelIconArray: [icon1] },
  { itemId: '3', label: 'Categories', labelIconArray: [icon1], children: [
      { itemId: '5', label: 'Social', labelIconArray: [icon1], labelInfo: '90', color: '#1a73e8', bgColor: '#e8f0fe', colorForDarkMode: '#B8E7FB', bgColorForDarkMode: alpha('#00b4ff', 0.2), children:[
        { itemId: '57', label: 'Social', labelIconArray: [icon1, icon4], labelInfo: '90', color: '#1a73e8', bgColor: '#e8f0fe', colorForDarkMode: '#B8E7FB', bgColorForDarkMode: alpha('#00b4ff', 0.2) },
        { itemId: '67', label: 'Updates', labelIconArray: [icon2, icon3], labelInfo: '2,294', color: '#e3742f', bgColor: '#fcefe3', colorForDarkMode: '#FFE2B7', bgColorForDarkMode: alpha('#ff8f00', 0.2) },
        { itemId: '77', label: 'Forums', labelIconArray: [icon1, icon3], labelInfo: '3,566', color: '#a250f5', bgColor: '#f3e8fd', colorForDarkMode: '#D9B8FB', bgColorForDarkMode: alpha('#9035ff', 0.15) },
        { itemId: '87', label: 'Promotions', labelIconArray: [icon1, icon4, icon2, icon3], labelInfo: '733', color: '#3c8039', bgColor: '#e6f4ea', colorForDarkMode: '#CCE8CD', bgColorForDarkMode: alpha('#64ff6a', 0.2) },
      ] },
      { itemId: '6', label: 'Updates', labelIconArray: [icon1], labelInfo: '2,294', color: '#e3742f', bgColor: '#fcefe3', colorForDarkMode: '#FFE2B7', bgColorForDarkMode: alpha('#ff8f00', 0.2) },
      { itemId: '7', label: 'Forums', labelIconArray: [icon1, icon3], labelInfo: '3,566', color: '#a250f5', bgColor: '#f3e8fd', colorForDarkMode: '#D9B8FB', bgColorForDarkMode: alpha('#9035ff', 0.15) },
      { itemId: '8', label: 'Promotions', labelIconArray: [icon1, icon4], labelInfo: '733', color: '#3c8039', bgColor: '#e6f4ea', colorForDarkMode: '#CCE8CD', bgColorForDarkMode: alpha('#64ff6a', 0.2) },
    ] 
  },
  { itemId: '4', label: 'History', labelIconArray: [icon1] }
];
export default function ChaiseTreeview() {
  return (
    <SimpleTreeView
      aria-label='gmail'
      defaultExpandedItems={['3']}
      defaultSelectedItems='5'
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon
      }}
      sx={{ flexGrow: 1, maxWidth: 400 }}
    >
      <div>
        {/* We pass the entire node to Treenode */}
      {treeData.map((node) => (
        <TreeNode key={node.itemId} node={node} />
      ))}
    </div>
    </SimpleTreeView>
  );
}

