const labels = ['Homogeneous', 'Graded', 'SingleCell'];

function getRandomLabels() {
  // Returns a random subset of labels array
  const randomCount = Math.floor(Math.random() * labels.length) + 1;
  const shuffled = labels.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randomCount);
}

let idCounter = 0; // Initialize a counter

function transformNode(node, isLastChild = false) {
  const label = `${node.base_text} (${node.dbxref})`;
  idCounter += 1; // Increment the counter for each node
  const uniqueId = `${label}-${idCounter}`; // Create a unique ID

  const transformedChildren = node.children.map((child, index) => 
    transformNode(child, index === node.children.length - 1)
  );

  return {
    ...node,
    label: label,
    id: uniqueId, // Assign the unique ID
    labelIconArray: getRandomLabels(),
    children: transformedChildren,
    lastChild: isLastChild // Mark the node as the last child if applicable
  };
}

function transformTree(data) {
  // Reset the counter before transforming the tree
  idCounter = 0;
  // Transform the tree
  return data.map(transformNode);
}

module.exports = transformTree;

