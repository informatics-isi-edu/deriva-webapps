import { memo, CSSProperties } from 'react';

import { LegendDatum } from '@isrd-isi-edu/deriva-webapps/hooks/matrix';

export type LegendProps = {
  /**
   * width of the legend
   */
  width: number;
  /**
   * height of the legend
   */
  height: number;
  /**
   * data shown
   */
  data: Array<LegendDatum>;
  /**
   * width of each color bar
   */
  itemSize: number;
  /**
   * color scale to use where index corresponds to ordering of scale shown
   */
  colorScale: Array<string>;
};

/**
 * Renders the legend for the colored matrix of data
 */
const Legend = ({ width, height, data, colorScale }: LegendProps): JSX.Element => {
  const legendStyles: CSSProperties = {
    height: height,
    width: width,
  };

  type LegendBarProps = {
    index: number;
  };

  /**
   * Each colored bar of the Legend
   */
  const LegendBar = ({ index }: LegendBarProps): JSX.Element => {
    const { colorIndex } = data[index];
    const color = colorScale[colorIndex];
    const legendBarStyle: CSSProperties = { backgroundColor: color };
    return (
      <div className='legend-bar-div'>
        <div className='legend-bar' style={legendBarStyle} />
      </div>
    );
  };

  type LegendHeaderProps = {
    index: number;
    legendHeight: number;
  };
  
  /**
   * Each header of the Legend
   */
  const LegendHeader = ({ index, legendHeight }: LegendHeaderProps) => {
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
