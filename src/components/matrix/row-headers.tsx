import { forwardRef, memo, ForwardedRef, CSSProperties } from 'react';
import { VariableSizeList as List, ListOnScrollProps } from 'react-window';

// Shared common props for row header
import SharedRowHeaders, { SharedRowHeadersProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix//shared-row-headers';

type RowHeadersProps = SharedRowHeadersProps & {
  /**
   * scroll function
   */
  onScroll?: (props: ListOnScrollProps) => any;
  /**
   * the width of List
   */
  listWidth: number;
};

/**
 * Virtualized row Header that displays headers as they scroll into the given height
 */
const RowHeaders = (props: RowHeadersProps, ref: ForwardedRef<any>): JSX.Element => {
  const { listData } = props.itemData;

  /**
   * Gets item size based on given index
   * Uses a different item size for the last margin row
   *
   * @param {number} index
   * @returns {number} item size
   */
  const itemSize = (index: number) => (index < listData.length - 1 ? props.cellHeight : props.cellHeight + 15);

  const rowHeadersStyles: CSSProperties = {
    position: 'relative',
    right: 0,
  };

  return (
    <SharedRowHeaders {...props}>
      <List
        className='grid-row-headers'
        style={rowHeadersStyles}
        height={props.height}
        itemSize={itemSize} // each row height
        width={props.listWidth}
        itemCount={props.itemCount}
        itemData={props.itemData}
        onScroll={props.onScroll}
        overscanCount={30}
        ref={ref}
      >
        {MemoizedHeader}
      </List>
    </SharedRowHeaders>
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
  const { hoveredRowID, setHoveredRowID, searchedRowID, setHoveredColID, listData } =
    data;
  let link = '';
  let title = '';
  let id = '';
  if (index < listData.length) {
    const rowData = listData[index][0];
    link = rowData.row.link;
    title = rowData.row.title;
    id = rowData.row.id;
  }

  let containerClassName = hoveredRowID === id ? 'hovered-cell' : 'unhovered-cell';
  let linkClassName = hoveredRowID === id ? 'hovered-header' : 'unhovered-header';
  if (searchedRowID === id) {
    containerClassName += ' searched-cell';
    linkClassName += ' searched-cell';
  }

  if (index === 0) {
    containerClassName += ' first-row-header';
  }

  if (index >= listData.length - 1) {
    containerClassName = 'row-margin';
  }

  return (
    <div
      className={`row-header ${containerClassName}`}
      style={style}
      onMouseEnter={() => {
        setHoveredRowID(id);
        setHoveredColID(null);
      }}
    >
      <a className={`row-header-link ${linkClassName}`} href={link} title={title}>
        {title}
      </a>
    </div>
  );
};

const MemoizedHeader = memo(HeaderComponent);

export default memo(forwardRef(RowHeaders));
