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
   *  data passed to each row
   */
  itemData?: any;
};

export type SharedRowHeadersCompProps = SharedRowHeadersProps & {
  children: JSX.Element,
};

const SharedRowHeaders = (
  { children }: SharedRowHeadersCompProps
): JSX.Element => {

  return (
    <div className='grid-row-headers-container'>
      {children}
    </div>
  )
};

export default SharedRowHeaders;
