import { memo, forwardRef, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

type ColumnHeadersProps = {
  cellHeight?: number; // height of grid cell
  cellWidth: number; // width of grid cell
  height: number; // height of each column header
  width: number; // width of all column headers
  itemCount: number; // number of items
  itemData?: any; // data passed to each column
  left: number; // how much to position the column left by
  onScroll?: ((props: ListOnScrollProps) => any) | undefined;
};

/**
 * Virtualized Column Header that displays headers as they scroll into the given width
 */
const ColumnHeaders = (
  { left, cellWidth, height, width, itemCount, itemData, onScroll }: ColumnHeadersProps,
  ref: ForwardedRef<any>
): JSX.Element => {
  const { listData } = itemData;

  /**
   * Gets item size based on given index
   * Uses a different item size for the last margin column
   *
   * @param {number} index
   * @returns {number} item size
   */
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

  /**
   * Header component for each column
   */
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
      width={width}
      itemSize={itemSize} // width of each column header
      height={height + 20}
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
