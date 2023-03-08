import { MouseEventHandler } from 'react';

type GridMoveButton = {
  onClick: MouseEventHandler;
  rowHeaderWidth: number;
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridLeftButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <button
      title='Scroll Left Button'
      className='grid-left-btn'
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 20,
        position: 'absolute',
        top: 12,
        left: rowHeaderWidth - 30,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        fill='#4674a7'
        className='bi bi-chevron-double-left'
        viewBox='0 0 16 16'
      >
        <path
          fillRule='evenodd'
          d='M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        />
        <path
          fillRule='evenodd'
          d='M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        />
      </svg>
    </button>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridUpButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        position: 'absolute',
        top: 25,
        width: rowHeaderWidth,
        paddingRight: 40,
      }}
    >
      <button
        title='Scroll Up Button'
        onClick={onClick}
        className='grid-up-btn'
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-up'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z'
          />
          <path
            fillRule='evenodd'
            d='M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z'
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridRightButton = ({ onClick }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 45,
        position: 'absolute',
        top: 2,
        right: 0,
      }}
    >
      <button
        title='Scroll Right Button'
        onClick={onClick}
        className='grid-down-btn'
        style={{ backgroundColor: 'transparent' }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-right'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z'
          />
          <path
            fillRule='evenodd'
            d='M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z'
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * SVG Icon for button from https://icons.getbootstrap.com/
 */
export const GridDownButton = ({ onClick, rowHeaderWidth }: GridMoveButton): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: rowHeaderWidth,
        paddingRight: 40,
      }}
    >
      <button
        title='Scroll Down Button'
        className='grid-down-btn'
        onClick={onClick}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          fill='#4674a7'
          className='bi bi-chevron-double-down'
          viewBox='0 0 16 16'
        >
          <path
            fillRule='evenodd'
            d='M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'
          />
          <path
            fillRule='evenodd'
            d='M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'
          />
        </svg>
      </button>
    </div>
  );
};
