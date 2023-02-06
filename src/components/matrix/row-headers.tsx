import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { FixedSizeList, ListOnScrollProps } from 'react-window';

type RowHeadersProps = {
  top: number;
  cellHeight: number;
  cellWidth: number;
  width: number;
  height: number;
  itemCount: number;
  itemData?: any;
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

const RowHeaders = (props: RowHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const { top, width, cellHeight, height, itemCount, itemData, onScroll } = props;

  const rowHeadersStyles: CSSProperties = {
    position: 'absolute',
    top: top,
  };

  type HeaderComponentProps = {
    index: number;
    data: any;
    style: CSSProperties;
  };

  const HeaderComponent = ({ index, data, style }: HeaderComponentProps): JSX.Element => {
    const { hoveredRowIndex, setHoveredRowIndex, setHoveredColIndex, listData } = data;
    const { row } = listData[index][0];
    const { link = '', title = '' } = row;

    const headerContainerStyles: CSSProperties = {
      overflow: 'hidden',
      height: cellHeight - 2,
      width: width,
    };

    const containerClassName = hoveredRowIndex === index ? 'hovered-cell' : 'unhovered-cell';
    const linkClassName = hoveredRowIndex === index ? 'hovered-header' : 'unhovered-header';
    return (
      <div
        style={style}
        onMouseEnter={() => {
          setHoveredRowIndex(index);
          setHoveredColIndex(null);
        }}
      >
        <div
          className={`row-header header-container ${containerClassName}`}
          style={headerContainerStyles}
        >
          <a
            className={`row-header-link ${linkClassName}`}
            style={{ height: cellHeight, width: width }}
            href={link}
            title={title}
          >
            {title}
          </a>
        </div>
      </div>
    );
  };

  return (
    <FixedSizeList
      className='grid-row-headers'
      style={rowHeadersStyles}
      height={height} // overall height
      itemSize={cellHeight} // each row height
      width={width} // each cell width
      itemCount={itemCount}
      itemData={itemData}
      onScroll={onScroll}
      overscanCount={30}
      ref={ref}
    >
      {memo(HeaderComponent)}
    </FixedSizeList>
  );
};

export default memo(forwardRef(RowHeaders));
