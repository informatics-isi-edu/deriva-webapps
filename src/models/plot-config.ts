import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
} from 'plotly.js';

/**
 * Config file for the plot
 */
export type PlotConfig = {
  /**
   * Data configs for plots
   */
  [name: string]: DataConfig;
};

/**
 * Data
 */
export type DataConfig = {
  /**
   * Plots for the data
   */
  plots: Plot[];
};

/**
 * Specific plot
 */
export type Plot = {
  /**
   * Type of plot
   */
  plot_type: 'bar' & 'violin' & 'pie' & 'scatter' & 'histogram';
  /**
   * Configurations for the plot
   */
  config: PlotConfigConfig;
  /**
   * Trace within each plot
   */
  traces: Trace[];
  /**
   * Pattern for gene uri
   */
  gene_uri_pattern?: string;
  /**
   * Pattern for study uri
   */
  study_uri_pattern?: string;
  /**
   * Plotly options
   */
  plotly?: Plotly;
};

/**
 * Plotly specific options
 */
export type Plotly = {
  /**
   * Configurations for plotly
   */
  config: PlotlyConfig;
  /**
   * Layout for plotly
   */
  layout: PlotlyLayout;
  /**
   * Data options for plotly
   */
  data?: Data;
};

export type PlotConfigConfig = {
  title_display_markdown_pattern?: string;
  xaxis?: PlotConfigAxis;
  yaxis?: PlotConfigAxis;
  format_data?: boolean;
  format_data_x?: boolean;
  format_data_y?: boolean;
  disable_default_legend_click?: boolean;
  slice_label?: string;
  x_axis_thousands_separator?: boolean;
  xbins?: number;
  ybins?: number;
  textinfo?: string;
  modeBarButtonsToRemove?: string[];
  displaylogo?: boolean;
  responsive?: boolean;
};

export type PlotConfigAxis = {
  title?: string;
  type?: string;
  title_display_markdown_pattern?: string;
  tick_display_markdown_pattern?: string;
  range?: number[];
  ticksuffix?: string;
  group_key?: string;
  group_keys?: PlotConfigAxisGroupKey[];
  default_all_studies_group?: string;
};

export type PlotConfigAxisGroupKey = {
  column_name: string;
  title_display_pattern: string;
  tick_display_markdown_pattern?: string;
  default?: boolean;
};

export type TraceConfig = {
  uri?: string;
  data_col?: string;
  legend_col?: string;
  legend_markdown_pattern?: string | string[];
  graphic_link_pattern?: string[] | string;
  legend?: string[];
  x_col?: string[];
  y_col?: string[];
  legendwidth?: number;
  queryPattern?: string;
};

export type TracePlotyData = Partial<PlotlyPlotData> &
  Partial<PlotlyViolinData> &
  Partial<PlotlyPieData>;

export type Trace = TraceConfig & TracePlotyData;

export type Font = {
  size: number;
  family?: string;
};

/**
 * Data options for plotly
 */
export type Data = {
  points: string;
  pointpos: number;
  box: Box;
  meanline: Meanline;
};

export type Box = {
  visible: boolean;
};

export type Meanline = {
  visible: boolean;
};
