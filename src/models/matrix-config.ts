export type MatrixDefaultConfig = {
  /**
   * returns the x axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   */
  xURL: string;
  /**
   * returns the tree data of the x axis
   * - must return child_id and parent_id.
   * - can contain other projected columns.
   */
  xTreeURL?: string;
  /**
   * returns the y axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   */
  yURL: string;
  /**
   * returns the tree data of the y axis
   * - must return child_id and parent_id.
   * - can contain other projected columns.
   */
  yTreeURL?: string;
  /**
   * returns the z axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   *
   * if undefined, we will not show the legend or colors
   */
  zURL: string;
  /**
   * API for xyz axis
   * (must return xid, yid, zid: group by `xid` and `yid` and return array aggregate of `zid`s.)
   */
  xysURL: string;

  x_link_pattern?: string;
  y_link_pattern?: string;
  z_link_pattern?: string;
  xys_link_pattern?: string;

  xys_markdown_pattern?: string;

  /**
   * key name of data from the x axis API response
   */
  xFacetColumn?: string;
  /**
   * key name of data from the y axis API response
   */
  yFacetColumn?: string;
  /**
   * key name of data from the z axis API response
   */
  zFacetColumn?: string;
  /**
   * The source path of y. used for generating the facet blob
   */
  xSource?: AxisSource;
  /**
   * The source path of y. used for generating the facet blob
   */
  ySource?: AxisSource;
  /**
   * The source path of z. used for generating the facet blob
   */
  zSource?: AxisSource;
  /**
   * the catalog name. used for generating the links
   */
  catalogId?: string;
  /**
   * the schema name. used for generating the links
   */
  schemaName?: string;
  /**
   * the table name. used for generating the links
   */
  tableName?: string;
  /**
   * Defines the title shown for the matrix
   */
  title_markdown?: string;
  /**
   * Defines the subtitle shown for the matrix
   */
  subtitle_markdown?: string;
  /**
   * Optional properties to override the default parameters for displaying the matrix.
   */
  styles?: MatrixStyles;
};

export type AxisSource = any;

export type MatrixStyles = {
  /**
   * Restricts the grid size to the given number of max columns. If not specified the grid grows infinitely
   * until it hits the viewport / window size that is defined by the iframe.
   */
  maxCols?: number;
  /**
   * Restricts the grid size to the given number of max rows, If not specified the grid grows infinitely
   * until it hits the viewport / window size that is defined by the iframe.
   */
  maxRows?: number;
  /**
   * Width of each cell within the grid
   */
  cellWidth?: number;
  /**
   * Height of each cell within the grid
   */
  cellHeight?: number;
  /**
   * Properties of the row headers
   */
  rowHeader?: RowHeaderStyles;
  /**
   * Properties of the column headers
   */
  columnHeader?: ColHeaderStyles;
  /**
   * Properties of the legend component
   */
  legend?: LegendStyles;
};

export type RowHeaderStyles = {
  /**
   * Width of the row headers
   */
  width?: number;
  /**
   * Whether allow scroll
   */
  scrollable?: boolean;
  /**
   * The max width of the scrollable content
   */
  scrollableMaxWidth?: number;
};

export type ColHeaderStyles = {
  /**
   * Height of the column headers
   */
  height?: number;
  /**
   * Whether allow scroll
   */
  scrollable?: boolean;
  /**
   * The max height of the scrollable content
   */
  scrollableMaxHeight?: number;
};

export type LegendStyles = {
  /**
   * Height of the legend
   */
  height?: number;
  /**
   * Width of the legend bar
   */
  barWidth?: number;
  /**
   * Height of the legend bar
   */
  barHeight?: number;
  /**
   * Max number of lines showing the legend content
   */
  lineClamp?: number;
};

export type MatrixConfig = {
  [name: '*' | string]: MatrixDefaultConfig;
};


export enum MatrixThemes {
  RAINBOW = 'rainbow',
  PARULA = 'parula',
  VIRIDIS = 'viridis'
}
