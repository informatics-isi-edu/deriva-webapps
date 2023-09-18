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
};

export type SharedColumnHeadersCompProps = SharedColumnHeadersProps & {
  children: JSX.Element,
};

const SharedColumnHeaders = (
  { children }: SharedColumnHeadersCompProps
): JSX.Element => {

  return (
    <div className='grid-column-headers-container'>
      {children}
    </div>
  )
};

export default SharedColumnHeaders;
