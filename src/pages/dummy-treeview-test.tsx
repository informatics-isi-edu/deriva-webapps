/* eslint-disable react/display-name */
import React, { useState, 
  useMemo, forwardRef, ForwardedRef} from 'react';
import ChaiseTreeview from '@isrd-isi-edu/deriva-webapps/src/components/chaise-treeview';

import { createRoot } from 'react-dom/client';

import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';

import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
const dummySettings = {
  appName: 'app/dummy',
  appTitle: 'Dummy',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
  openIframeLinksInTab: true,
};
// Adjusted TypeScript interfaces to ensure children are always included
type TreeNode = {
  id: string;
  name: string;
  title: string;
  key: string;
  children: TreeNode[]; // Children are now mandatory
}

interface ItemData {
  [key: string]: {
    name: string;
    // Any additional fields can be included here
  };
}

type TreeNodeMap = {
  [key: string]: TreeNode;
};

// Adjusted dummy treeNodes to include an empty children array where necessary
const treeNodes: TreeNode[] = [
  {
    id: '1',
    name: 'Root Node',
    title: 'Root Node Title',
    key: '1',
    children: [
      {
        id: '1-1',
        name: 'Child Node 1',
        title: 'Child Node 1 Title',
        key: '1-1',
        children: [
          {
            id: '1-1-1',
            name: 'Grandchild Node 1',
            title: 'Grandchild Node 1 Title',
            key: '1-1-1',
            children: [] // Empty children array added
          },
          {
            id: '1-1-2',
            name: 'Grandchild Node 2',
            title: 'Grandchild Node 2 Title',
            key: '1-1-2',
            children: [] // Empty children array added
          },
        ],
      },
      {
        id: '1-2',
        name: 'Child Node 2',
        title: 'Child Node 2 Title',
        key: '1-2',
        children: [] // Empty children array added
      },
    ],
  },
  {
    id: '2',
    name: 'Another Root Node',
    title: 'Another Root Node Title',
    key: '2',
    children: [] // Empty children array added
  },
  {
    id: '3',
    name: 'Third Root Node',
    title: 'Third Root Node Title',
    key: '3',
    children: [] // Empty children array added
  },
];
interface Node {
  child_id: string;
  parent_id: string;
}

const treeData: Node[] = [
  { child_id: 'UBERON:0001049', parent_id: '' }, // Example of a root node
  { child_id: 'UBERON:0002371', parent_id: 'UBERON:0001049' }, // Child of the first node
  { child_id: 'UBERON:0002372', parent_id: 'UBERON:0001049' }, // Another child of the first node
  { child_id: 'UBERON:0002373', parent_id: '' }, // Another root node
  { child_id: 'UBERON:0002374', parent_id: 'UBERON:0002373' }, // Child of the fourth node
];

// Constructing itemData and treeNodesMap from treeNodes
const data: ItemData = {};
treeNodes.forEach(node => {
  data[node.id] = { name: node.name };
  node.children.forEach(child => {
    data[child.id] = { name: child.name };
  });
});

const height = 200;
const width = 250;
const cellWidth = 25;
const scrollable = true;
const scrollableMaxWidth = 300
const top = 80;
const itemCount =2;
const treeNodesMap: TreeNodeMap = treeNodes.reduce<TreeNodeMap>((acc, node) => {
  acc[node.id] = node;
  node.children.forEach(child => {
    acc[child.id] = child;
  });
  return acc;
}, {});


const App= forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const [hoveredRowID, setHoveredRowID] = useState<string | null>(null); // hovered row state for row headers
  const [hoveredColID, setHoveredColID] = useState<string | null>(null); // hovered col state for col headers
  const [searchedRowID, setSearchedRowID] = useState<string | null>(null); // searched row state for row headers
  const [searchedColID, setSearchedColID] = useState<string | null>(null); // searched col state for col headers

  const [visiableRowNodes, setVisiableRowNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
  const [visiableColNodes, setVisiableColNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in xTree and grid

  // track scrolling
  const [isScrolling, setIsScrolling] = useState(false); // State to track whether scrolling is happening
  const itemData = useMemo(
    () => ({
      searchedRowID,
      hoveredRowID,
      setHoveredRowID,
      setHoveredColID,
      setVisiableRowNodes,
      isScrolling,
      listData: data,
    }),
    [searchedRowID, hoveredRowID, data, isScrolling]
  );

  const modifiedItemData = useMemo(() => ({
    ...itemData,
    searchedColID, 
    hoveredColID, 
    setHoveredRowID,
    setHoveredColID,
    setVisiableColNodes
    // Make any other necessary modifications specific to columns
  }), [itemData, searchedColID, hoveredColID, isScrolling]);

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };
  return (
    <>
  <div style={{ height: '50vh', width: '100%', position: 'relative' }}>
      <ChaiseTreeview
        className="grid-row-headers-treeview"
        expanded={expanded}
        onNodeToggle={handleNodeToggle}
        props={{
          treeData,
          itemCount,
          top,
          scrollable,
          scrollableMaxWidth,
          height,
          width,
          cellWidth,
          treeNodes,
          itemData,
          treeNodesMap,
          cellHeight: 20, // This should be adjusted based on your layout needs
        }}
        scrollableDimension={500} // This should be adjusted based on your UI layout
        isScrolling={false} // Can be state-driven if your component needs to react to scrolling
      />
    </div>
    {/*  */}
    {/* <div style={{ height: '50vh', width: '100%', position: 'relative' }}>
        <ChaiseTreeview
          className="grid-column-headers-treeview"
          expanded={expanded}
          onNodeToggle={handleNodeToggle}
          props={{
            treeData,
            itemCount,
            top,
            scrollable,
            scrollableMaxWidth,
            height,
            width,
            cellWidth,
            treeNodes,
            itemData: modifiedItemData, 
            treeNodesMap,
            cellHeight: 20, // This should be adjusted based on your layout needs
          }}
          scrollableDimension={500} // This should be adjusted based on your UI layout
          isScrolling={false} // Can be state-driven if your component needs to react to scrolling
        />
      </div> */}
      </>
  );
});

const rootElement = document.getElementById(ID_NAMES.APP_ROOT);
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <AppWrapper appSettings={dummySettings}>
      <App  />
    </AppWrapper>
  );
}

