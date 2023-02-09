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
