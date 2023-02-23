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
  barWidth: number;
  /**
   * height of each color bar
   */
  barHeight: number;
  /**
   * color scale to use where index corresponds to ordering of scale shown
   */
  colorScale: Array<string>;
};

/**
 * Renders the legend for the colored matrix of data
 */
const Legend = ({
  width,
  height,
  barWidth,
  barHeight,
  data,
  colorScale,
}: LegendProps): JSX.Element => {
  const legendStyles: CSSProperties = {
    height: height,
    width: width,
  };

  return (
    <div className='legend-container' style={legendStyles}>
      <div className='legend-bars-container'>
        {data.map((legendData, index) => (
          <MemoizedLegendBar
            key={legendData.title}
            index={index}
            width={barWidth}
            height={barHeight}
            data={data}
            colorScale={colorScale}
          />
        ))}
      </div>
      <div className='legend-links-container'>
        {data.map((legendData, index) => (
          <MemoizedLegendHeader
            key={legendData.title}
            index={index}
            width={barWidth}
            legendHeight={height}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};

type LegendBarProps = {
  index: number;
  data: Array<LegendDatum>;
  colorScale: Array<string>;
  width: number;
  height: number;
};

/**
 * Each colored bar of the Legend
 */
const LegendBar = ({ index, data, width, height, colorScale }: LegendBarProps): JSX.Element => {
  const { colorIndex } = data[index];
  const color = colorScale[colorIndex];
  const legendBarStyle: CSSProperties = { backgroundColor: color };
  return (
    <div className='legend-bar-div' style={{ width: width, height: height }}>
      <div className='legend-bar' style={legendBarStyle} />
    </div>
  );
};

const MemoizedLegendBar = memo(LegendBar);

type LegendHeaderProps = {
  index: number;
  data: Array<LegendDatum>;
  legendHeight: number;
  width: number;
};

/**
 * Each header of the Legend
 */
const LegendHeader = ({ index, legendHeight, data, width }: LegendHeaderProps) => {
  const { link, title } = data[index];

  return (
    <div className='legend-link-div' style={{ width: width }}>
      <a className='legend-link' href={link} title={title}>
        <div className='split-text' style={{ width: legendHeight - 25 }}>
          {title}
        </div>
      </a>
    </div>
  );
};

const MemoizedLegendHeader = memo(LegendHeader);

export default memo(Legend);
