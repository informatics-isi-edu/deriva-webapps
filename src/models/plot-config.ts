import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
  PlotData,
} from 'plotly.js';

/**
 * Config file for the plot
 */
export type PlotConfig = {
  [name: string]: DataConfig;
};

/**
 * Data
 */
export type DataConfig = {
  plots: Plot[];
};

/**
 * Specific plot
 */
export type Plot = {
  plot_type: 'bar' & 'violin' & 'pie' & 'scatter' & 'histogram';
  config: PlotConfigConfig;
  traces: Trace[];
  gene_uri_pattern?: string;
  study_uri_pattern?: string;
  plotly?: Plotly;
};

/**
 * Plotly specific options
 */
export type Plotly = {
  config: PlotlyConfig;
  layout: PlotlyLayout;
};

/**
 * Configs for the plot
 */
export type PlotConfigConfig = {
  title_display_markdown_pattern?: string;
  xaxis?: PlotConfigAxis;
  yaxis?: PlotConfigAxis;
  format_data?: boolean;
  format_data_x?: boolean;
  format_data_y?: boolean;
  disable_default_legend_click?: boolean;
  slice_label?: PlotData['textinfo'];
  x_axis_thousands_separator?: boolean;
  xbins?: number;
  ybins?: number;
  textinfo?: string;
  modeBarButtonsToRemove?: string[];
  displaylogo?: boolean;
  responsive?: boolean;
};

/**
 * Axis configs for the plot
 */
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

/**
 * Group key configs for the plot
 */
export type PlotConfigAxisGroupKey = {
  column_name: string;
  title_display_pattern: string;
  tick_display_markdown_pattern?: string;
  default?: boolean;
};

/**
 * Trace configs
 */
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

/**
 * Trace data
 */
export type TracePlotyData = Partial<PlotlyPlotData> &
  Partial<PlotlyViolinData> &
  Partial<PlotlyPieData>;

/**
 * Trace configs
 */
export type Trace = TraceConfig & TracePlotyData;
