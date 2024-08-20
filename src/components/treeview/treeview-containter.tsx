
import Box from '@mui/material/Box';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { alpha, Button, styled, SvgIcon } from '@mui/material';
import SearchInput from '@isrd-isi-edu/chaise/src/components/search-input';
import { useTreeViewApiRef } from '@mui/x-tree-view/hooks/useTreeViewApiRef';
import React from 'react';
// hooks
import { useLayoutEffect, useEffect, useRef } from 'react';
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
    flexDirection: `column-reverse`,

  };
};
interface OptionType {
  label: string;
  id: number;
}

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

// utils
import { attachContainerHeightSensors } from '@isrd-isi-edu/chaise/src/utils/ui-utils';
import { any } from '@isrd-isi-edu/deriva-webapps/treeview/util/q';

const TreeviewContainer = (children: any): JSX.Element => {
  /**
 * make sure the setup is done only once
   */
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

  const apiRef = useTreeViewApiRef();
  const [selectedItems, setSelectedItems] = React.useState([]);

  function OpenSquare() {
    return (
      <SvgIcon
        className="plus"
        fontSize="inherit"
        style={{ width: 12, height: 12 }}
      >
        {/* <path fill="black" fillOpacity="1" d="M11 7v4H7v2h4v4h2v-4h4v-2h-4V7h-2zM24 24H0V0h24v24zm-2-2V2H2v20h20z" />
         */}

        <path fill="white" d="M0 0h24v24H0z" />
        <path fill="black" d="M2 2h20v20H2z" />
        <path fill="white" d="M4 4h16v16H4z" />
        <path fill="black" d="M7 11h10v2H7z M11 7h2v10h-2z" />

      </SvgIcon>


    );
  }
  function CloseSquare() {
    return (
      <SvgIcon
        className="minus"
        fontSize="inherit"
        style={{
          width: 12, height: 12,
          top: '10px',  // Adjust the top and left values as needed
          left: '10px', // Adjust the top and left values as needed
          zIndex: 1000, // Ensure this is higher than other elements on the page
        }}
      >
        {/* <path fill="black" fillOpacity="1" d="M7 11h10v2H7v-2zM24 24H0V0h24v24zm-2-2V2H2v20h20z" />
         */}
        <path fill="white" d="M0 0h24v24H0z" />
        <path fill="black" d="M2 2h20v20H2z" />
        <path fill="white" d="M4 4h16v16H4z" />
        <path fill="black" d="M7 11h10v2H7z" />
      </SvgIcon>



    );
  }
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


  // Newer version --------------
  function searchTreeArray(treeArray: any[], key: string, searchValue: string): { paths: string[], values: string[] } {
    let paths: string[] = [];
    let values: string[] = [];

    treeArray.forEach(node => {
      const results = searchTree(node, key, searchValue);
      paths = paths.concat(results.paths);
      values = values.concat(results.values);
    });

    return { paths, values };
  }


  function searchTree(node: any, key: string, searchValue: string, currentPath = ''): { paths: string[], values: string[] } {
    let paths: string[] = [];
    let values: string[] = [];
    const nodePath = currentPath ? `${currentPath}/${node[key]}` : node[key];
    // const nodePath = currentPath ? `${currentPath}/${node.label}` : node.label;

    // Check if the current node's key exists and matches the search criteria
    if (node[key] && node[key].includes(searchValue)) {
      paths.push(nodePath);
      values.push(node[key]);
    }

    // If the node has children, recursively search through them
    if (Array.isArray(node.children)) {
      for (let child of node.children) {
        const childResults = searchTree(child, key, searchValue, nodePath);
        paths = paths.concat(childResults.paths);
        values = values.concat(childResults.values);
      }
    }

    return { paths, values };
  }
  // ---------------



  // const searchCallback = (term: any) => {
  //   if (term) {
  //     term = term.trim();
  //     console.log(`User attempting to search for '${term}'`);
  //     // Todo: keep track whats expanded already

  //     let results = searchTreeArray(children.mui_x_product, 'id', term);

  //     console.log(results);

  //     setExpandedItems(results.paths || []); // Assuming path is string[] or null

  //     // Set the ID of the first found item to be focused on later
  //     // const firstItem = path && path.length > 0 ? path[0] : null;

  //     // [It only highlights when find a unique one]
  //     if (results.paths.length > 0) {
  //       // paths.forEach((element: string) => {
  //       //   setSelectedItemId(element);
  //       // });

  //       // setSelectedItemId(results.values[0]);
  //       handleButtonClick(results.values[0]);
  //       // paths = ['deltoid (EMAPA:18177)', 'pars scapularis of deltoid (EMAPA:36163)']
  //       results.values.forEach((path: any) => {
  //         const element = apiRef.current?.getItemDOMElement(path);
  //         if (element) {
  //           element.style.fontStyle = 'italic';
  //           element.style.color = '#2e00ff';
  //           element.style.backgroundColor = '#efefa6';
  //         }
  //       });
  //       // setSelectedItems(paths);
  //     }
  //   }
  // };

  function parsePathsFromStrings(inputStrings: string[]): string[] {
    const result: string[] = [];

    for (const inputString of inputStrings) {
      const paths = inputString.split('/');
      for (const path of paths) {
        result.push(path.trim());
      }
    }

    return result;
  }

  const searchCallback = (term: any) => {
    // Function to reset styles of all nodes
    const resetStyles = () => {
      const allElements = document.querySelectorAll('.highlighted'); // Assuming you add a class to highlighted elements
      allElements.forEach((element: any) => {
        element.style.fontStyle = '';
        element.style.color = '';
        element.style.backgroundColor = '';
        element.classList.remove('highlighted');
        const aTag = element.querySelector('a');
        if (aTag) {
          aTag.style.backgroundColor = 'white'; // Reset the background color of the 'a' tag
        }
      });
    };

    if (term) {
      term = term.trim();
      console.log(`User attempting to search for '${term}'`);
      // Todo: keep track whats expanded already

      let results = searchTreeArray(children.mui_x_product, 'id', term);

      // results.values.push("Reichert's cartilage (EMAPA:36319)-1");

      results.paths = parsePathsFromStrings(results.paths);
      console.log(results);
      setExpandedItems(results.paths); // Assuming path is string[] or null

      setTimeout(() => {
        if (results.paths.length > 0) {
          handleButtonClick(results.values[0]);
          results.values.forEach((id: any) => {
            const element = apiRef.current?.getItemDOMElement(id);
            console.log(element?.innerHTML);
            if (element) {
              const aTag = element.querySelector('a');
              if (aTag) {
                aTag.style.backgroundColor = '#efefa6';
              }
              element.style.fontStyle = 'italic';
              element.style.color = '#2e00ff';
              element.classList.add('highlighted');
            }
          });
        } else {
          resetStyles();
          console.log('Term is empty, reset styles and expanded items');
        }
      }, 0);
    } else {
      resetStyles();
      console.log('Term is empty, reset styles and expanded items');
    }

  };

  const expandId = (itemId: any) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }) as unknown as React.SyntheticEvent;
    apiRef.current?.setItemExpansion(
      // The DOM event that triggered the change
      event,
      // The id of the item to expand or collapse
      itemId,
      true
    );
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


  const handleButtonClick = (id: string) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }) as unknown as React.SyntheticEvent;

    apiRef.current?.focusItem(event, id);
  };

  function getItemId(item: any) {
    // return item.label;
    return item.id;
  }

  const setupStarted = useRef<boolean>(false);

  // properly set scrollable section height
  useEffect(() => {
    const resizeSensors = attachContainerHeightSensors();

    return () => {
      resizeSensors?.forEach((rs) => !!rs && rs.detach());
    }
  }, []);


  return (
    <div className='treeview-container app-content-container'>
      <div className='top-panel-container'>
        <div className='top-flex-panel'>
          <div className='top-left-panel close-panel closable-panel'></div>
          <div className='top-right-panel' style={{ display: 'flex', alignItems: 'center' }}>
            {/* TODO */}

            <div className="search-container" style={{ width: '250px' }}>
              <SearchInput
                initialSearchTerm=''
                inputClass='treeview-search-input'
                searchCallback={searchCallback}
                searchColumns={false}
                disabled={false}
              />
            </div>
            <Button variant="outlined" style={{ marginLeft: '10px', height: '30px' }} className="expand-button">Expand All</Button>
            <Button variant="outlined" style={{ height: '30px' }} className="collapse-button">Collapse All</Button>


          </div>
        </div>
      </div>
      <div className='bottom-panel-container'>
        <div className='side-panel-resizable resizable close-panel closable-panel'>
          <div className='side-panel-container'>
            {/* TODO */}
            side panel that is currently closed
          </div>
        </div>
        <div className='main-container dynamic-padding'>
          <div className='main-body'>
            {/* TODO */}
            {children.expandDirection == 'left' || children.expandDirection == 'right' ? (
              <Box sx={{ minHeight: 352, minWidth: 250 }}>
                <RichTreeView
                  slots={{
                    expandIcon: OpenSquare,
                    collapseIcon: CloseSquare,
                    item: children.nodeType
                  }}
                  items={children.mui_x_product}
                  getItemId={getItemId}
                  apiRef={apiRef}
                  expandedItems={expandedItems}
                  onExpandedItemsChange={handleExpandedItemsChange}
                />
              </Box>
            ) : (
              // <Container>
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
              // </Container>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeviewContainer;
