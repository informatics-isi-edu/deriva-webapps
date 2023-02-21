import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

type RowHeadersProps = {
  top: number; // top position of row headers
  cellHeight: number; // height of grid cell
  cellWidth: number; // width of grid cell
  width: number; // each row width
  height: number; // overall height
  itemCount: number; // number of items
  itemData?: any; // data passed to each column
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

/**
 * Virtualized row Header that displays headers as they scroll into the given height
 */
const RowHeaders = (
  { top, width, cellHeight, height, itemCount, itemData, onScroll }: RowHeadersProps,
  ref: ForwardedRef<any>
): JSX.Element => {
  const { listData } = itemData;

  /**
   * Gets item size based on given index
   * Uses a different item size for the last margin row
   *
   * @param {number} index
   * @returns {number} item size
   */
  const itemSize = (index: number) => (index < listData.length - 1 ? cellHeight : cellHeight + 3);

  const rowHeadersStyles: CSSProperties = {
    position: 'absolute',
    top: top,
  };

  type HeaderComponentProps = {
    index: number; // index of the row
    data: any; // data passed from headers
    style: CSSProperties;
  };

  /**
   * Header component for each row
   */
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
      height={height}
      itemSize={itemSize} // each row height
      width={width}
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
