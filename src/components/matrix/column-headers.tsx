import { memo, forwardRef, ForwardedRef, CSSProperties } from 'react';
import { FixedSizeList, ListOnScrollProps } from 'react-window';

type ColumnHeadersProps = {
  cellHeight?: number;
  cellWidth: number;
  height: number;
  width: number;
  itemCount: number;
  itemData?: any;
  left: number;
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

const ColumnHeaders = (props: ColumnHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const { left, cellWidth, height, width, itemCount, itemData, onScroll } = props;

  const columnHeadersStyles: CSSProperties = {
    position: 'absolute',
    left: left + 'px',
  };

  type HeaderComponentProps = {
    index: number;
    data: any;
    style: CSSProperties;
  };

  const HeaderComponent = ({ index, data, style }: HeaderComponentProps): JSX.Element => {
    const { hoveredColIndex, setHoveredRowIndex, setHoveredColIndex, listData } = data;
    const { column } = listData[0][index];
    const { link, title } = column;

    const headerContainerStyles: CSSProperties = {
      height: height,
      width: cellWidth,
    };

    const linkClassName = hoveredColIndex === index ? 'hovered-header' : 'unhovered-header';
    return (
      <div
        style={style}
        onMouseEnter={() => {
          setHoveredRowIndex(null);
          setHoveredColIndex(index);
        }}
      >
        <div className='column-header header-container' style={headerContainerStyles}>
          <a className={`column-header-link ${linkClassName}`} href={link} title={title}>
            {title}
          </a>
        </div>
      </div>
    );
  };

  return (
    <FixedSizeList
      className='grid-column-headers'
      style={columnHeadersStyles}
      width={width} // width of all column headers + buffer to display rotated text :(
      itemSize={cellWidth} // width of each column header
      height={height} // height of each column header
      layout='horizontal'
      itemCount={itemCount}
      onScroll={onScroll}
      itemData={itemData}
      overscanCount={30}
      ref={ref}
    >
      {memo(HeaderComponent)}
    </FixedSizeList>
  );
};

export default memo(forwardRef(ColumnHeaders));
