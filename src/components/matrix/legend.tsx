import { memo, CSSProperties } from 'react';

type LegendProps = {
  width: number;
  height: number;
  data: Array<any>;
  itemSize: number;
  colorScale: Array<string>;
};

const Legend = ({ width, height, data, colorScale }: LegendProps): JSX.Element => {

  const legendStyles: CSSProperties = {
    height: height,
    width: width,
  };

  type LegendPartProps = {
    index: number;
    legendHeight: number;
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

  const LegendHeader = ({ index, legendHeight }: LegendPartProps) => {
    const { link, title } = data[index];
    const wrappedTextElements = (
      <div className='split-text' style={{ width: legendHeight - 25 }}>
        {title}
      </div>
    );
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
          <LegendHeader
            key={legendData.title}
            index={index}
            legendHeight={height}
            {...legendData}
          />
        ))}
      </div>
    </div>
  );
};


export default memo(Legend);
