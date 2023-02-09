import { memo, CSSProperties } from 'react';

type LegendProps = {
  width: number;
  height: number;
  data: Array<any>;
  itemSize: number;
  colorScale: Array<string>;
};

const Legend = (props: LegendProps): JSX.Element => {
  const { width, data, colorScale } = props;

  const legendStyles: CSSProperties = {
    width: width,
  };

  type LegendPartProps = {
    index: number;
    colorScale: Array<string>;
  };

  const LegendBar = ({ index }: LegendPartProps): JSX.Element => {
    const { colorIndex } = data[index];
    const color = colorScale[colorIndex];
    const legendBarStyle: CSSProperties = { backgroundColor: color };
    return (
      <div className='legend-bar-div'>
        <div className='legend-bar' style={legendBarStyle} />
      </div>
    );
  };

  const LegendHeader = ({ index }: LegendPartProps) => {
    const { link, title } = data[index];
    const wrappedTextElements = splitter(title, 45).map((text, i) => <div key={i}>{text}</div>);
    return (
      <div className='legend-link-div'>
        <a className='legend-link' href={link} title={title}>
          {wrappedTextElements}
        </a>
      </div>
    );
  };

  return (
    <div className='legend-container' style={legendStyles}>
      <div className='legend-bars-container'>
        {data.map((legendData, index) => (
          <LegendBar key={legendData.title} index={index} {...legendData} />
        ))}
      </div>
      <div className='legend-links-container'>
        {data.map((legendData, index) => (
          <LegendHeader key={legendData.title} index={index} {...legendData} />
        ))}
      </div>
    </div>
  );
};

// https://stackoverflow.com/questions/7624713/js-splitting-a-long-string-into-strings-with-char-limit-while-avoiding-splittin
const splitter = (str: string, l: number) => {
  const strs = [];
  while (str.length > l) {
    let pos = str.substring(0, l).lastIndexOf(' ');
    pos = pos <= 0 ? l : pos;
    strs.push(str.substring(0, pos));
    let i = str.indexOf(' ', pos) + 1;
    if (i < pos || i > pos + l) i = pos;
    str = str.substring(i);
  }
  strs.push(str);
  return strs;
};

export default memo(Legend);
