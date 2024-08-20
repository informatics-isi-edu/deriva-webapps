// const labels = ['Homogeneous', 'Graded', 'SingleCell'];

// function getRandomLabels() {
//   // Returns a random subset of labels array
//   const randomCount = Math.floor(Math.random() * labels.length) + 1;
//   const shuffled = labels.sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, randomCount);
// }

// function transformNode(node) {
//     const label = `${node.base_text} (${node.dbxref})`;
//     return {
//       ...node,
//       label: label,
//       id: label,
//       labelIconArray: getRandomLabels(),
//       children: node.children.map(transformNode),
//     };
//   }
  
//   function transformTree(data) {
//     // Transform the tree
//     return data.map(transformNode);
//   }
  
//   module.exports = transformTree;
const labels = ['Homogeneous', 'Graded', 'SingleCell'];

function getRandomLabels() {
  // Returns a random subset of labels array
  const randomCount = Math.floor(Math.random() * labels.length) + 1;
  const shuffled = labels.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randomCount);
}

let idCounter = 0; // Initialize a counter

function transformNode(node) {
  const label = `${node.base_text} (${node.dbxref})`;
  idCounter += 1; // Increment the counter for each node
  const uniqueId = `${label}-${idCounter}`; // Create a unique ID

  return {
    ...node,
    label: label,
    id: uniqueId, // Assign the unique ID
    labelIconArray: getRandomLabels(),
    children: node.children.map(transformNode),
  };
}

function transformTree(data) {
  // Reset the counter before transforming the tree
  idCounter = 0;
  // Transform the tree
  return data.map(transformNode);
}

module.exports = transformTree;
