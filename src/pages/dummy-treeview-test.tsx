/* eslint-disable react/display-name */
import React, {
  useState,
  useMemo, forwardRef, useRef
} from 'react';
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
type properties = {
  homogenous?: Boolean,
  regional?: Boolean,
  restricted?: Boolean
}
// Adjusted TypeScript interfaces to ensure children are always included
type TreeNode = {
  id: string;
  name: string;
  title: string;
  key: string;
  children: TreeNode[]; // Children are now mandatory
  properties?: properties
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
    key: 'UBERON:0001049',
    properties: {
      homogenous: true,
      regional: false,
      restricted: true
    },
    children: [
      {
        id: '1-1',
        name: 'Child Node 1',
        title: 'Child Node 1 Title',
        key: 'UBERON:0001050',
        children: [
          {
            id: '1-1-1',
            name: 'Grandchild Node 1',
            title: 'Grandchild Node 1 Title',
            key: 'UBERON:0001051',
            children: []
          },
          {
            id: '1-1-2',
            name: 'Grandchild Node 2',
            title: 'Grandchild Node 2 Title',
            key: 'UBERON:0001052',
            children: []
          },
          // Adding new grandchild nodes under Child Node 1
          {
            id: '1-1-3',
            name: 'Grandchild Node 3',
            title: 'Grandchild Node 3 Title',
            key: 'UBERON:0002056',
            children: []
          },
          {
            id: '1-1-4',
            name: 'Grandchild Node 4',
            title: 'Grandchild Node 4 Title',
            key: 'UBERON:0002057',
            children: []
          },
          {
            id: '1-1-5',
            name: 'Grandchild Node 5',
            title: 'Grandchild Node 5 Title',
            key: 'UBERON:0002058',
            children: []
          }
        ],
      },
      {
        id: '1-2',
        name: 'Child Node 2',
        title: 'Child Node 2 Title',
        key: 'UBERON:0001053',
        children: []
      },
      // Adding new child nodes under Root Node
      {
        id: '1-3',
        name: 'Child Node 3',
        title: 'Child Node 3 Title',
        key: 'UBERON:0002059',
        children: []
      },
      {
        id: '1-4',
        name: 'Child Node 4',
        title: 'Child Node 4 Title',
        key: 'UBERON:0002060',
        children: []
      }
    ],
  },
  {
    id: '2',
    name: 'Another Root Node',
    title: 'Another Root Node Title',
    key: 'UBERON:0001054',
    children: []
  },
  {
    id: '3',
    name: 'Third Root Node',
    title: 'Third Root Node Title',
    key: 'UBERON:0001055',
    children: []
  },
  // Adding new root nodes
  {
    id: '4',
    name: 'Fourth Root Node',
    title: 'Fourth Root Node Title',
    key: 'UBERON:0002061',
    children: []
  },
  {
    id: '5',
    name: 'Fifth Root Node',
    title: 'Fifth Root Node Title',
    key: 'UBERON:0002062',
    children: []
  },
  {
    id: '6',
    name: 'Sixth Root Node',
    title: 'Sixth Root Node Title',
    key: 'UBERON:0002063',
    children: []
  },
  {
    id: '7',
    name: 'Seventh Root Node',
    title: 'Seventh Root Node Title',
    key: 'UBERON:0002064',
    children: []
  }
];

interface Node {
  child_id: string;
  parent_id: string;
}

const treeData: Node[] = [
  { child_id: 'UBERON:0001049', parent_id: '' },
  { child_id: 'UBERON:0001050', parent_id: 'UBERON:0001049' },
  { child_id: 'UBERON:0001053', parent_id: 'UBERON:0001049' },
  { child_id: 'UBERON:0001051', parent_id: 'UBERON:0001050' },
  { child_id: 'UBERON:0001052', parent_id: 'UBERON:0001050' },
  { child_id: 'UBERON:0001054', parent_id: '' },
  { child_id: 'UBERON:0001055', parent_id: '' },
  // New entries for newly added nodes
  { child_id: 'UBERON:0002056', parent_id: 'UBERON:0001050' },
  { child_id: 'UBERON:0002057', parent_id: 'UBERON:0001050' },
  { child_id: 'UBERON:0002058', parent_id: 'UBERON:0001050' },
  { child_id: 'UBERON:0002059', parent_id: 'UBERON:0001049' },
  { child_id: 'UBERON:0002060', parent_id: 'UBERON:0001049' },
  { child_id: 'UBERON:0002061', parent_id: '' },
  { child_id: 'UBERON:0002062', parent_id: '' },
  { child_id: 'UBERON:0002063', parent_id: '' },
  { child_id: 'UBERON:0002064', parent_id: '' }
];

const columnTreeNodes: TreeNode[] = [
  {
    id: '10',
    name: 'Primary Node',
    title: 'Primary Node Overview',
    key: 'UBERON:0002049',
    children: [
      {
        id: '10-1',
        name: 'First Child Node',
        title: 'Detailed First Child Node',
        key: 'UBERON:0002050',
        children: [
          {
            id: '10-1-1',
            name: 'First Grandchild Node',
            title: 'Overview of First Grandchild Node',
            key: 'UBERON:0002051',
            children: []
          },
          {
            id: '10-1-2',
            name: 'Second Grandchild Node',
            title: 'Detailed Second Grandchild Node',
            key: 'UBERON:0002052',
            children: []
          },
        ],
      },
      {
        id: '10-2',
        name: 'Second Child Node',
        title: 'Overview of Second Child Node',
        key: 'UBERON:0002053',
        children: []
      },
    ],
  },
  {
    id: '20',
    name: 'Secondary Root Node',
    title: 'Overview of Secondary Root Node',
    key: 'UBERON:0002054',
    children: []
  },
  {
    id: '30',
    name: 'Tertiary Root Node',
    title: 'Detailed Tertiary Root Node',
    key: 'UBERON:0002055',
    children: []
  },
];
const columnTreeData: Node[] = [
  { child_id: 'UBERON:0002049', parent_id: '' }, // Primary Node
  { child_id: 'UBERON:0002050', parent_id: 'UBERON:0002049' }, // Child of the primary node
  { child_id: 'UBERON:0002053', parent_id: 'UBERON:0002049' }, // Child of the primary node
  { child_id: 'UBERON:0002051', parent_id: 'UBERON:0002050' }, // Child of the first child node
  { child_id: 'UBERON:0002052', parent_id: 'UBERON:0002050' }, // Another child of the first child node
  { child_id: 'UBERON:0002054', parent_id: '' }, // Secondary root node
  { child_id: 'UBERON:0002055', parent_id: '' }, // Tertiary root node
];

// Constructing itemData and treeNodesMap from treeNodes
const data: ItemData = {};
treeNodes.forEach(node => {
  data[node.id] = { name: node.name };
  node.children.forEach(child => {
    data[child.id] = { name: child.name };
  });
});
const columndata: ItemData = {};
columnTreeNodes.forEach(node => {
  columndata[node.id] = { name: node.name };
  node.children.forEach(child => {
    columndata[child.id] = { name: child.name };
  });
});
const height = 200;
const width = 250;
const cellWidth = 25;
const scrollable = true;
const scrollableMaxWidth = 300
const top = 80;
const itemCount = 2;
const treeNodesMap: TreeNodeMap = treeNodes.reduce<TreeNodeMap>((acc, node) => {
  acc[node.id] = node;
  node.children.forEach(child => {
    acc[child.id] = child;
  });
  return acc;
}, {});
const columntreeNodesMap: TreeNodeMap = columnTreeNodes.reduce<TreeNodeMap>((acc, node) => {
  acc[node.id] = node;
  node.children.forEach(child => {
    acc[child.id] = child;
  });
  return acc;
}, {});
const App = forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const [hoveredRowID, setHoveredRowID] = useState<string | null>(null); // hovered row state for row headers
  const [hoveredColID, setHoveredColID] = useState<string | null>(null); // hovered col state for col headers
  const [searchedRowID, setSearchedRowID] = useState<string | null>(null); // searched row state for row headers
  const [searchedColID, setSearchedColID] = useState<string | null>(null); // searched col state for col headers

  const [visiableRowNodes, setVisiableRowNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in yTree and grid
  const [visiableColNodes, setVisiableColNodes] = useState<Set<string> | null>(new Set<string>()); // visiable rows in xTree and grid
  const divRef = useRef<any>(null);
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

  const modifiedItemData = useMemo(
    () => ({
      searchedColID,
      hoveredColID,
      setHoveredRowID,
      setHoveredColID,
      setVisiableColNodes,
      isScrolling,
      listData: columndata
      // Make any other necessary modifications specific to columns
    }), [searchedColID, hoveredColID, columndata, isScrolling]);

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };
  return (
    <>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{
          display: 'flex',               
          // justifyContent: 'center',       
          height: '50vh',                 
          width: '100%',
          direction: 'ltr'                  
        }}>
        <ChaiseTreeview />
        </div>


        <div style={{ height: '50vh', width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}>
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


