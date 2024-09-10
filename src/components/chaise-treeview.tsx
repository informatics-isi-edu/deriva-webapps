
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { alpha, styled } from '@mui/material';
import SearchInput from '@isrd-isi-edu/chaise/src/components/search-input';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks/useTreeViewApiRef';
import React, { useEffect } from 'react';

export const groupTransitionStyle = (theme: any, expandleft: boolean = false, expandRight: boolean = false) => {
  if (expandleft) {
    return {
      display: 'flex',
      flexDirection: 'row',
      marginLeft: 0,
      paddingLeft: 0,
      marginRight: '15px',
      paddingRight: '18px',
      borderRight: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    };
  }
  if (expandRight) {
    return {
      marginLeft: 15,
      paddingLeft: 18,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    };
  }
  return {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    flexDirection: 'column-reverse',

  };
};

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflowX: 'auto',
  overflowY: 'auto',
  whiteSpace: 'nowrap',
  transform: 'rotate(-90deg)',
  maxHeight: 250,
  minWidth: 250,
  marginRight: 100
});

export default function ChaiseTreeview(children: any) {

  // flatten Tree to search through the nodes
  const flattenedTree: any[] = [];
  function flattened(node: any) {
    flattenedTree.push(node);
    if (node.children) {
      node.children.forEach((element: any) => {
        flattened(element);
      });
    }
  }

  children.mui_x_product.forEach(flattened);  // State to manage expanded items
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // large tree performance maybe?
  const findPath = (tree: any[], targetLabel: string, path: string[] = []): any => {
    for (const node of tree) {
      const newPath = [...path, node.label]; // Append current node's label to the path :- might be an issue
      if (node.label === targetLabel) {
        return newPath; // Return the path if target is found
      }
      if (node.children) {
        const result = findPath(node.children, targetLabel, newPath);
        if (result) return result; // Return the path if target is found in children
      }
    }
    return null; // Return null if target is not found in the tree
  };

  const searchCallback = (term: any) => {
    if (term) {
      term = term.trim();
      console.log(`User attempting to search for '${term}'`);
      // Todo: keep track whats expanded already

      const path = findPath(children.mui_x_product, term);
      // const path = []
      setExpandedItems(path || []); // Assuming path is string[] or null

      // Set the ID of the first found item to be focused on later
      const firstItem = path && path.length > 0 ? path[0] : null;
      setSelectedItemId(term);
    }
  };

  const handleExpandedItemsChange = (event: React.SyntheticEvent, itemId: any) => {
    const foundItems = flattenedTree.filter(node => node.label.includes(itemId));
    setExpandedItems(itemId);
  };

  useEffect(() => {
    // Call handleButtonClick when selectedItemId changes and is not null
    if (selectedItemId) {
      handleButtonClick(selectedItemId);
    }
  }, [selectedItemId]);

  const apiRef = useTreeViewApiRef();

  const handleButtonClick = (itemId: string | null) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }) as unknown as React.SyntheticEvent;
    apiRef.current?.focusItem(
      // The DOM event that triggered the change
      event,
      // The ID of the item to focus
      itemId === null ? '' : itemId,
    );
  };

  function getItemId(item: any) {
    return item.label;
  }

  return (

    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <SearchInput
            initialSearchTerm=''
            inputClass='treeview-search-input'
            searchCallback={searchCallback}
            searchColumns={false}
            disabled={false}
          />

        </Box>

        {children.expandDirection === 'left' || children.expandDirection === 'right' ? (
          <Box sx={{ minHeight: 352, minWidth: 250 }}>
            <RichTreeView
              slots={{
                expandIcon: AddBoxIcon,
                collapseIcon: IndeterminateCheckBoxIcon,
                item: children.nodeType,
              }}
              items={children.mui_x_product}
              getItemId={getItemId}
              apiRef={apiRef}
              expandedItems={expandedItems}
              onExpandedItemsChange={handleExpandedItemsChange}

            />
          </Box>
        ) : (
          <Container>
            <RichTreeView
              defaultExpandedItems={['grid']}
              slots={{
                expandIcon: AddBoxIcon,
                collapseIcon: IndeterminateCheckBoxIcon,
                item: children.nodeType,
              }}
              getItemId={getItemId}
              items={children.mui_x_product}
              expandedItems={expandedItems}

            />
          </Container>
        )}
      </Box>
    </>
  );
}
