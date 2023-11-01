import { CSSProperties, useEffect, useRef } from 'react';

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
   * the max height of scrollable content when the header is scrollable
   */
  scrollableMaxHeight: number;
};

export type SharedColumnHeadersCompProps = SharedColumnHeadersProps & {
  children: JSX.Element,
};

const SharedColumnHeaders = (
  { children, height, width, scrollable, scrollableMaxHeight }: SharedColumnHeadersCompProps
): JSX.Element => {

  const containerRef = useRef<HTMLDivElement | null>(null);

  // This is used to initialize the position of scroll bar to bottom, when scrollable height is auto
  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        // Scroll to the bottom when the component mounts
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100); // This slight delay ensures that the rendering is complete.
  }, []);

  const columnHeadersContainerStyles: CSSProperties = {
    height: height,
    width: width,
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'relative',
  };

  const columnHeadersContainerHorizontalScrollStyles: CSSProperties = {
    overflowX: 'hidden',
    overflowY: 'hidden',
    position: 'relative',
    width: width,
    height: scrollable && scrollableMaxHeight === -1 ? 'fit-content' : scrollableMaxHeight,
    left: 0,
  };

  return (
    <div ref={containerRef} className='grid-column-headers-container' style={columnHeadersContainerStyles}>
      <div className='grid-column-headers-horizontal-scroll' style={columnHeadersContainerHorizontalScrollStyles}>
        {children}
      </div>
    </div>
  )
};

export default SharedColumnHeaders;
