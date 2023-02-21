/**
 * Converts Scalar values from 0-1 to RGB 0-255 scale by multiplying each by 255
 * Given scale is in the form of a flat array where every 3 numbers correspond to
 * the Red, Green, and Blue values.
 *
 * @param {Array<number>} scale Given scale with values from 0-1
 * @returns {Array<Array<number>>} rgb values
 */
export const generateScale = (scale: Array<number>) => {
  const colorScale = [];
  for (let i = 0; i < scale.length; i += 3) {
    const r = Math.round(scale[i] * 255);
    const g = Math.round(scale[i + 1] * 255);
    const b = Math.round(scale[i + 2] * 255);
    colorScale.push([r, g, b]);
  }
  return colorScale;
};

/**
 * Gets one color from the given index within the given color scale, for a given desired palette length.
 * Will fail if the index and/or length is out of range of the given color scale.
 *
 * @param {Array<Array<number>>} colorScale
 * @param {number} length
 * @param {number} index
 * @returns {string} the rgb in the form of 'rgb(r,g,b)'
 */
export const getColor = (
  colorScale: Array<Array<number>>,
  length: number,
  index: number
): string => {
  const stepSize = Math.floor(colorScale.length / length);
  const currColor = colorScale[stepSize * index];
  const r = currColor[0];
  const g = currColor[1];
  const b = currColor[2];
  const rgb = `rgb(${r}, ${g}, ${b})`;
  return rgb;
};

/**
 * @desc Generates specified number of rainbow colors.
 * from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
 * @param  {integer} len  Number of colors.
 * @return {Array} An Array of colors (string) in the rgb('r','g','b') format
 */
export const generateRainbowColor = (len: number, i: number) => {
  const frequency = 5 / len;
  const r = Math.floor(Math.sin(frequency * i) * 127 + 128);
  const g = Math.floor(Math.sin(frequency * i + 2) * 127 + 128);
  const b = Math.floor(Math.sin(frequency * i + 4) * 127 + 128);
  return 'rgb(' + r + ', ' + g + ', ' + b + ')';
};
