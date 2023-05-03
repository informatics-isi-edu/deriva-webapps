/**
 * Flattens the given 2D array into a 1D array
 *
 * @param arr
 * @returns {any[]} flat array
 */
export const flatten2DArray = (arr: any[][]) => {
  return arr.reduce((acc, val) => acc.concat(val), []);
};
