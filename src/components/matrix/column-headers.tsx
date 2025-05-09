import { memo, forwardRef, ForwardedRef, CSSProperties, type JSX } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';
import { isStringAndNotEmpty } from '@isrd-isi-edu/chaise/src/utils/type-utils';

// Shared common props for column header
import SharedColumnHeaders, { SharedColumnHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-column-headers';

type ColumnHeadersProps = SharedColumnHeadersProps & {
  /**
   * scroll function
   */
  onScroll?: (props: ListOnScrollProps) => any;
  /**
   * the height of List
   */
  listHeight: number;
};

/**
 * Virtualized Column Header that displays headers as they scroll into the given width
 */
const ColumnHeaders = (props: ColumnHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const { listData } = props.itemData;

  /**
   * Gets item size based on given index
   * Uses a different item size for the last margin column
   *
   * @param {number} index
   * @returns {number} item size
   */
  const itemSize = (index: number) => (index < listData[0].length - 1 ? props.cellWidth : props.cellWidth + 30);

  const columnHeadersStyles: CSSProperties = {
    position: 'relative',
    left: 0,
  };

  return (
    <SharedColumnHeaders {...props}>
      <List
        className='grid-column-headers'
        style={columnHeadersStyles}
        width={props.width}
        itemSize={itemSize} // width of each column header
        height={props.listHeight}
        layout='horizontal'
        itemCount={props.itemCount}
        onScroll={props.onScroll}
        itemData={props.itemData}
        overscanCount={30}
        ref={ref}
      >
        {MemoizedHeader}
      </List>
    </SharedColumnHeaders>
  );
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
  const { hoveredColID, setHoveredRowID, setHoveredColID, searchedColID, listData } =
    data;

  const { column } = listData[0][index];
  const { link, title, id } = column;

  const linkClassName = hoveredColID === id ? 'hovered-header' : 'unhovered-header';
  const linkDivClassName = searchedColID === id ? 'searched-header' : 'unsearched-header';

  let WrapperEL: React.ElementType = 'span';
  if (isStringAndNotEmpty(link)) {
    WrapperEL = 'a';
  }

  return (
    <div
      className='column-header'
      style={style}
      onMouseEnter={() => {
        setHoveredRowID(null);
        setHoveredColID(id);
      }}
    >
      <WrapperEL className={`column-header-link ${linkClassName}`} title={title} {...(WrapperEL === 'a' && { href: link })}>
        <div className={linkDivClassName}>{title}</div>
      </WrapperEL>
    </div>
  );
};

const MemoizedHeader = memo(HeaderComponent);

export default memo(forwardRef(ColumnHeaders));
