// Data type used for treeview
import { MatrixTreeDatum } from '@isrd-isi-edu/deriva-webapps/src/hooks/matrix';

/**
 * Check whether all ancestors of a node exist in visitedNode list
 */
export const checkParentChainExist = (treeDataDict: Record<string, MatrixTreeDatum>, nodeId: string, visitedNodes: Set<string>): boolean => {
  const node = treeDataDict[nodeId];
  if (node.parent_id === null) {
    return true; // Reached the top of the chain
  }
  if (!visitedNodes.has(node.parent_id)) {
    return false; // Detected the parent node does not exist in visitedNodes
  }
  return checkParentChainExist(treeDataDict, node.parent_id, visitedNodes);
};

/**
 * Find all ancestor nodes of the searched node
 */
export const getParentChain = (treeDataDict: Record<string, MatrixTreeDatum>, nodeId: string, visitedNodes: Set<string>): Set<string> => {
  let node = treeDataDict[nodeId];
  if (node.parent_id === null) {
    return visitedNodes; // Reached the top of the chain
  }
  node = treeDataDict[node.parent_id];
  while (node && node.child_id !== null) {
    visitedNodes.add(node.child_id);
    node = treeDataDict[node.parent_id];
  }
  return visitedNodes;
};