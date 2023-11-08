import ChaiseTooltip from '@isrd-isi-edu/chaise/src/components/tooltip';
import { MouseEventHandler } from 'react';

export type GridMoveButton = {
  onClick: MouseEventHandler;
  rowHeaderWidth: number;
  columnHeaderHeight?: number;
  headerScrollable?: boolean;
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridLeftButton = ({ onClick, rowHeaderWidth, columnHeaderHeight }: GridMoveButton): JSX.Element => {
  return (
    <div
      className='grid-scroll-btn-container grid-scroll-left-btn-container'
      style={{
        alignItems: 'center',
        justifyContent: 'end',
        height: columnHeaderHeight,
        width: rowHeaderWidth,
        top: 0,
      }}
    >
      <ChaiseTooltip tooltip='Scroll left' placement='bottom'>
        <button onClick={onClick}><i className='fa-solid fa-angles-left'></i></button>
      </ChaiseTooltip>
    </div>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridUpButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <div
      className='grid-scroll-btn-container grid-scroll-up-btn-container'
      style={{
        justifyContent: 'center',
        top: 25,
        width: rowHeaderWidth
      }}
    >
      <ChaiseTooltip tooltip='Scroll up' placement='bottom'>
        <button onClick={onClick}><i className='fa-solid fa-angles-up'></i></button>
      </ChaiseTooltip>
    </div>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridRightButton = ({ onClick, columnHeaderHeight, headerScrollable }: GridMoveButton): JSX.Element => {
  return (
    <div
      className='grid-scroll-btn-container grid-scroll-right-btn-container'
      style={{
        alignItems: 'center',
        background: 'white',
        height: columnHeaderHeight,
        top: 0,
        // If the column headers is scrollable, then push the gridRightButton right
        right: headerScrollable ? -20 : 0,
      }}
    >
      <ChaiseTooltip tooltip='Scroll right' placement='bottom'>
        <button onClick={onClick}><i className='fa-solid fa-angles-right'></i></button>
      </ChaiseTooltip>
    </div>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridDownButton = ({ onClick, rowHeaderWidth, headerScrollable }: GridMoveButton): JSX.Element => {
  return (
    <div
      className='grid-scroll-btn-container grid-scroll-down-btn-container'
      style={{
        justifyContent: 'center',
        background: 'white',
        // If the row headers is scrollable, then push the gridDownButton bottom
        bottom: headerScrollable ? -20 : 0,
        left: 0,
        width: rowHeaderWidth
      }}
    >
      <ChaiseTooltip tooltip='Scroll down' placement='bottom'>
        <button onClick={onClick}><i className='fa-solid fa-angles-down'></i></button>
      </ChaiseTooltip>
    </div>
  );
};
