import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { FixedSizeList, ListOnScrollProps } from 'react-window';

type LegendProps = {
  width: number;
  height: number;
  data: Array<any>;
  style?: CSSProperties;
  itemSize: number;
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

const Legend = (props: LegendProps, ref: ForwardedRef<any>): JSX.Element => {
  const { style, itemSize, width, height, data } = props;

  type LegendCellProps = {
    index: number;
    style: CSSProperties;
  };

  const LegendCell = ({ index, style }: LegendCellProps): JSX.Element => {
    const { color, link, title } = data[index];
    const legendBarStyle: CSSProperties = { backgroundColor: color };
    return (
      <div style={style}>
        <div className='legend-cell-container'>
          <div className='legend-bar' style={legendBarStyle} />
          <a className='legend-link' href={link} title={title}>
            {title}
          </a>
        </div>
      </div>
    );
  };

  return (
    <FixedSizeList
      className='legend-container'
      style={style}
      height={height} // height of each element
      width={width} // width of entire list
      itemSize={itemSize} // width of each element
      itemCount={data.length}
      overscanCount={5}
      layout='horizontal'
      ref={ref}
    >
      {memo(LegendCell)}
    </FixedSizeList>
  );
};

export default memo(forwardRef(Legend));
