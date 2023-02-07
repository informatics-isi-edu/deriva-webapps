import { forwardRef, memo, CSSProperties } from 'react';

type LegendProps = {
  width: number;
  height: number;
  data: Array<any>;
  itemSize: number;
};

const Legend = (props: LegendProps): JSX.Element => {
  const { width, data } = props;

  const legendStyles: CSSProperties = {
    width: width,
  };

  type LegendPartProps = {
    index: number;
  };

  const LegendBar = ({ index }: LegendPartProps): JSX.Element => {
    const { color } = data[index];
    const legendBarStyle: CSSProperties = { backgroundColor: color };
    return (
      <div className='legend-bar-div'>
        <div className='legend-bar' style={legendBarStyle} />
      </div>
    );
  };

  const LegendHeader = ({ index }: LegendPartProps) => {
    const { link, title } = data[index];
    return (
      <div className='legend-link-div'>
        <a className='legend-link' href={link} title={title}>
          {title}
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

export default memo(Legend);
