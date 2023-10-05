import { CSSProperties } from 'react';

export type SharedColumnHeadersProps = {
  /**
   * height of grid cell
   */
  cellHeight?: number;
  /**
   * width of grid cell
   */
  cellWidth: number;
  /**
   *  height of each column header
   */
  height: number;
  /**
   * width of all column headers
   */
  width: number;
  /**
   * number of columns
   */
  itemCount: number;
  /**
   * data passed to each column
   */
  itemData?: any;
  /**
   * left position of column
   */
  left: number;
  /**
   * whether the header is scrollable
   */
  scrollable: boolean;
  /**
   * the max width of scrollable content when the header is scrollable
   */
  scrollableMaxWidth: number;
};

export type SharedColumnHeadersCompProps = SharedColumnHeadersProps & {
  children: JSX.Element,
};

const SharedColumnHeaders = (
  { children, height, width }: SharedColumnHeadersCompProps
): JSX.Element => {

  const columnHeadersContainerStyles: CSSProperties = {
    height: height,
    width: width,
    overflowY: 'hidden',
    position: 'relative',
  };

  return (
    <div className='grid-column-headers-container' style={columnHeadersContainerStyles}>
      {children}
    </div>
  )
};

export default SharedColumnHeaders;
