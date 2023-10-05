import { CSSProperties } from 'react';

export type SharedRowHeadersProps = {
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
   * data passed to each row
   */
  itemData?: any;
  /**
   * whether the header is scrollable
   */
  scrollable: boolean;
  /**
   * the max width of scrollable content when the header is scrollable
   */
  scrollableMaxWidth: number;
};

export type SharedRowHeadersCompProps = SharedRowHeadersProps & {
  children: JSX.Element,
};

const SharedRowHeaders = (
  { children, width }: SharedRowHeadersCompProps
): JSX.Element => {

  const rowHeadersContainerStyles: CSSProperties = {
    width: width,
    overflowX: 'hidden',
    position: 'relative',
  };

  return (
    <div className='grid-row-headers-container' style={rowHeadersContainerStyles}>
      {children}
    </div>
  )
};

export default SharedRowHeaders;
