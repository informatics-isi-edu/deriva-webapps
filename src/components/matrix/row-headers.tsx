import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

type RowHeadersProps = {
  /**
   * top position of row headers
   */
  top: number;
  /**
   * height of grid cell
   */
  cellHeight: number;
  /**
   * width of grid cell
   */
  cellWidth: number;
  /**
   * each row width
   */
  width: number;
  /**
   * overall height
   */
  height: number;
  /**
   * number of rows
   */
  itemCount: number;
  /**
   *  data passed to each row
   */
  itemData?: any;
  /**
   * on scroll event
   */
  onScroll?: (props: ListOnScrollProps) => any;
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
  const itemSize = (index: number) => (index < listData.length - 1 ? cellHeight : cellHeight + 15);

  const rowHeadersStyles: CSSProperties = {
    position: 'absolute',
    top: top,
  };

  return (
    <List
      className='grid-row-headers'
      style={rowHeadersStyles}
      height={height}
      itemSize={itemSize} // each row height
      width={width}
      itemCount={itemCount}
      itemData={itemData}
      onScroll={onScroll}
      overscanCount={30}
      ref={ref}
    >
      {MemoizedHeader}
    </List>
  );
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
      <div className={`row-header ${containerClassName}`}>
        <a className={`row-header-link ${linkClassName}`} href={link} title={title}>
          {title}
        </a>
      </div>
    </div>
  );
};

const MemoizedHeader = memo(HeaderComponent);

export default memo(forwardRef(RowHeaders));
