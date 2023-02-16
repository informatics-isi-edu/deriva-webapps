import { memo, forwardRef, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

type ColumnHeadersProps = {
  cellHeight?: number;
  cellWidth: number;
  height: number;
  width: number;
  itemCount: number;
  itemData?: any;
  left: number;
  bufferWidth?: number;
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

const ColumnHeaders = (props: ColumnHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const { left, cellWidth, height, width, bufferWidth = 0, itemCount, itemData, onScroll } = props;
  const { listData } = itemData;

  const itemSize = (index: number) => (index < listData[0].length - 1 ? cellWidth : cellWidth + 30);

  const columnHeadersStyles: CSSProperties = {
    position: 'absolute',
    left: left,
  };

  type HeaderComponentProps = {
    index: number;
    data: any;
    style: CSSProperties;
  };

  const HeaderComponent = ({ index, data, style }: HeaderComponentProps): JSX.Element => {
    const { hoveredColIndex, setHoveredRowIndex, setHoveredColIndex, searchedColIndex, listData } =
      data;

    const { column } = listData[0][index];
    const { link, title } = column;

    const headerContainerStyles: CSSProperties = {
      height: height,
      width: cellWidth,
    };

    const linkClassName = hoveredColIndex === index ? 'hovered-header' : 'unhovered-header';
    const linkDivClassName = searchedColIndex === index ? 'searched-header' : 'unsearched-header';

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
            <div className={linkDivClassName}>{title}</div>
          </a>
        </div>
      </div>
    );
  };

  return (
    <List
      className='grid-column-headers'
      style={columnHeadersStyles}
      width={width} // width of all column headers + buffer to display rotated text :(
      itemSize={itemSize} // width of each column header
      height={height + 20} // height of each column header
      layout='horizontal'
      itemCount={itemCount}
      onScroll={onScroll}
      itemData={itemData}
      overscanCount={30}
      ref={ref}
    >
      {memo(HeaderComponent)}
    </List>
  );
};

export default memo(forwardRef(ColumnHeaders));