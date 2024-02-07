export type MatrixDefaultConfig = {
  /**
   * returns the x axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   */
  x_url: string;
  /**
   * returns the tree data of the x axis
   * - must return child_id and parent_id.
   * - can contain other projected columns.
   */
  x_tree_url?: string;
  /**
   * returns the y axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   */
  y_url: string;
  /**
   * returns the tree data of the y axis
   * - must return child_id and parent_id.
   * - can contain other projected columns.
   */
  y_tree_url?: string;
  /**
   * returns the z axis data
   * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
   * - can contain other projected columns
   *
   * if undefined, we will not show the legend or colors
   */
  z_url: string;
  /**
   * API for xyz axis
   * (must return xid, yid, zid: group by `xid` and `yid` and return array aggregate of `zid`s.)
   */
  xys_url: string;
  /**
   * the pattern that should be used for x link
   */
  x_link_pattern?: string;
  /**
   * the pattern that should be used for y link
   */
  y_link_pattern?: string;
  /**
   * the pattern that should be used for z link
   */
  z_link_pattern?: string;
  /**
   * the pattern that should be used for cell link
   */
  xys_link_pattern?: string;
  /**
   * the displayed value in the cell
   */
  xys_markdown_pattern?: string;

  /**
   * key name of data from the x axis API response
   */
  x_facet_column?: string;
  /**
   * key name of data from the y axis API response
   */
  y_facet_column?: string;
  /**
   * key name of data from the z axis API response
   */
  z_facet_column?: string;
  /**
   * The source path of y. used for generating the facet blob
   */
  x_source?: AxisSource;
  /**
   * The source path of y. used for generating the facet blob
   */
  y_source?: AxisSource;
  /**
   * The source path of z. used for generating the facet blob
   */
  z_source?: AxisSource;
  /**
   * the catalog name. used for generating the links
   */
  catalog_id?: string;
  /**
   * the schema name. used for generating the links
   */
  schema_name?: string;
  /**
   * the table name. used for generating the links
   */
  table_name?: string;
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

  /**
   * change the used color pallete and available options
   */
  color_palette?: {
    default_option?: MatrixColorPalletes,
    options?: MatrixColorPalletes[]
  },

  /**
   * whether we should hide the searchbox or not
   */
  hide_search_box?: boolean
};

export enum MatrixColorPalletes {
  RAINBOW = 'rainbow',
  PARULA = 'parula',
  VIRDIDIS = 'viridis'
}

export type AxisSource = any;

export type MatrixStyles = {
  /**
   * Restricts the grid size to the given number of max columns. If not specified the grid grows infinitely
   * until it hits the viewport / window size that is defined by the iframe.
   */
  max_displayed_columns?: number;
  /**
   * Restricts the grid size to the given number of max rows, If not specified the grid grows infinitely
   * until it hits the viewport / window size that is defined by the iframe.
   */
  max_displayed_rows?: number;
  /**
   * Width of each cell within the grid
   */
  cell_width?: number;
  /**
   * Height of each cell within the grid
   */
  cell_height?: number;
  /**
   * Properties of the row headers
   */
  row_header?: RowHeaderStyles;
  /**
   * Properties of the column headers
   */
  column_header?: ColHeaderStyles;
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
  scrollable_max_width?: number;
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
  scrollable_max_height?: number;
};

export type LegendStyles = {
  /**
   * Height of the legend
   */
  height?: number;
  /**
   * Width of the legend bar
   */
  bar_width?: number;
  /**
   * Height of the legend bar
   */
  bar_height?: number;
  /**
   * Max number of lines showing the legend content
   */
  line_clamp?: number;
};

export type MatrixConfig = {
  [name: '*' | string]: MatrixDefaultConfig;
};
