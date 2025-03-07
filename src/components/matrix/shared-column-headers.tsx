import { CSSProperties, useEffect, useState, useRef, type JSX } from 'react';

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
  /**
   * Only contains this when the inner header is tree
   */
  innerColumnHeaderHeight?: number,
};

const SharedColumnHeaders = (
  { children, height, width, scrollable, scrollableMaxHeight, innerColumnHeaderHeight }: SharedColumnHeadersCompProps
): JSX.Element => {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bottomPadding, setBottomPadding] = useState<number>(0);

  // This is used to initialize the position of scroll bar to bottom, when scrollable height is auto
  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        // Scroll to the bottom when the component mounts
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100); // This slight delay ensures that the rendering is complete.
  }, []);

  /**
   * When scrollable height is auto, tree headers, and header height is longer than the inner tree header
   * Then inner tree header will be in the middle of the column headers container.
   * To address it and put it be the bottom, we need to get the height of inner column header, and adjust the style based on this
   */
  useEffect(() => {
    // No need to do this when not scrollable, scrollable height is not auto, or not tree
    if (!scrollable || scrollableMaxHeight !== -1 || innerColumnHeaderHeight === undefined) return;

    if (height < innerColumnHeaderHeight) {
      setBottomPadding(0);
      return;
    }
    // Adjust the position of inner tree header to the bottom of the column headers container
    const newBottomPadding = - (height - innerColumnHeaderHeight);
    setBottomPadding(newBottomPadding);
  }, [innerColumnHeaderHeight]);

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
    // Normal cases, bottom is set to 0
    // Dynamically change, when scrollable height is auto, tree headers, and header height is longer than the inner tree header
    bottom: scrollable && scrollableMaxHeight === -1 && bottomPadding !== 0 ? bottomPadding : 0,
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
