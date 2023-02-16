import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

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
  const { listData } = itemData;

  const itemSize = (index: number) => (index < listData.length - 1 ? cellHeight : cellHeight + 3);

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
    const { hoveredRowIndex, setHoveredRowIndex, setHoveredColIndex, searchedRowIndex, listData } =
      data;
    let link = '';
    let title = '';
    if (index < listData.length) {
      const rowData = listData[index][0];
      link = rowData.row.link;
      title = rowData.row.title;
    }

    const headerContainerStyles: CSSProperties = {
      overflow: 'hidden',
      height: cellHeight,
      width: width,
    };

    let containerClassName = hoveredRowIndex === index ? 'hovered-cell' : 'unhovered-cell';
    let linkClassName = hoveredRowIndex === index ? 'hovered-header' : 'unhovered-header';
    if (searchedRowIndex === index) {
      containerClassName += ' searched-cell';
      linkClassName += ' searched-cell';
    }

    if (index >= listData.length - 1) {
      containerClassName = 'row-margin';
    }

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
          <a className={`row-header-link ${linkClassName}`} href={link} title={title}>
            {title}
          </a>
        </div>
      </div>
    );
  };

  return (
    <List
      className='grid-row-headers'
      style={rowHeadersStyles}
      height={height} // overall height
      itemSize={itemSize} // each row height
      width={width} // each cell width
      itemCount={itemCount + 1}
      itemData={itemData}
      onScroll={onScroll}
      overscanCount={30}
      ref={ref}
    >
      {memo(HeaderComponent)}
    </List>
  );
};

export default memo(forwardRef(RowHeaders));
