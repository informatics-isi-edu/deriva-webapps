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
  { children, width, scrollable, scrollableMaxWidth, height, top }: SharedRowHeadersCompProps
): JSX.Element => {

  const rowHeadersContainerStyles: CSSProperties = {
    width: width,
    overflowX: 'scroll',
    overflowY: 'hidden',
    position: 'relative',
    direction: 'rtl',
    willChange: 'transform',
  };

  const rowHeadersContainerHorizontalScrollStyles: CSSProperties = {
    overflowX: 'hidden',
    overflowY: 'hidden',
    position: 'relative',
    width: scrollable && scrollableMaxWidth===-1 ? 'fit-content' : scrollableMaxWidth,
    direction: 'rtl',
    height: height,
    top: top,
    right: 0,
  };

  return (
    <div className='grid-row-headers-container' style={rowHeadersContainerStyles}>
      {/* The below div is for handling the scroll behaviour in horizontal direction */}
      <div className='grid-row-headers-horizontal-scroll' style={rowHeadersContainerHorizontalScrollStyles}>
        {children}
      </div>
    </div>
  )
};

export default SharedRowHeaders;
