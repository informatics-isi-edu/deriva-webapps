import { memo, CSSProperties } from 'react';

type LegendProps = {
  width: number; // width of the legend
  height: number; // height of the legend
  data: Array<any>; // data shown
  itemSize: number; // width of each color bar
  colorScale: Array<string>; // color scale to use where index corresponds to ordering of scale shown
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

  /**
   * Each colored bar of the Legend
   */
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

  /**
   * Each header of the Legend
   */
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
