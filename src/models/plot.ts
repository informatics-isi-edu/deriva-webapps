import {
  Layout as PlotlyLayout,
  Config as PlotlyConfig,
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
  PlotData,
} from 'plotly.js';
import { ResponsiveProps as ResponsiveGridConfig } from 'react-grid-layout';


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

export type UserControlDataConfig={
  Name: string;
  Display: string;
}

export type UserControlConfig = {
  uid: string;
  label: string;
  url_param_key?: string;
  request_info: UserControlRequestInfoConfig;
}

export type UserControlRequestInfoConfig = {
  url_pattern?: string;
  data?: UserControlDataConfig[];
  default_value?: string;
  value_key: string;
  selected_value_pattern?: string;
  tick_markdown_pattern: string;
}



/**
 * Specific plot
 */
export type Plot = {
  plot_type: string;
  config: PlotConfigConfig;
  layout: LayoutConfig;
  grid_layout_config?: ResponsiveGridConfig;
  traces: Trace[];
  gene_uri_pattern?: string;
  study_uri_pattern?: string;
  plotly?: Plotly;
  user_controls: UserControlConfig[]; //NOTE: For now user_controls will be considered of type dropdown only
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
  tickangle?: number;
  group_key?: string;
  group_keys?: PlotConfigAxisGroupKey[];
  default_all_studies_group?: string;
};

/**
 * Group key configs for the plot
 */
export type PlotConfigAxisGroupKey = {
  column_name: string;
  title: string;
  title_display_pattern: string;
  tick_display_markdown_pattern?: string;
  default?: boolean;
};

/**
 * Trace configs
 */
export type Trace = {
  uri?: string;
  data_col?: string | string[];
  legend_col?: string | string[];
  legend_markdown_pattern?: string | string[];
  graphic_link_pattern?: string[] | string;
  hovertemplate_display_pattern?: string;
  legend?: string[];
  x_col?: string[];
  y_col?: string[];
  z_col?: string[];
  type?: string[];
  mode?: string[];
  marker?: string[];
  legendwidth?: number;
  url_pattern?: string;
  // queryPattern will be deprecated
  queryPattern?: string;
  response_format?: 'csv' & 'json';
  orientation?: 'h' & 'v';
  xgap?: number;
  ygap?: number;
};

/**
 * Breakpoint config
 */
export type BreakpointConfig =
{
  lg: number; 
  md: number; 
  sm: number; 
  xs: number;
}

/**
 * Margin/Padding config
 */
export type MarginPaddingConfig =
{
  lg: [number, number]; 
  md: [number, number]; 
  sm: [number, number]; 
  xs: [number, number];
}

/**
 * Layout config for selector
 */
export type LayoutConfig = {
  source_uid: any;
  x: number;
  y: number;
  w: number; 
  h: number;
  min_w: number;
  max_w: number;
  min_h: number;
  max_h: number;
  static: boolean;
  is_draggable: boolean;
  is_resizable: boolean;
}

/**
 * Trace data
 */
export type TracePlotyData = Partial<PlotlyPlotData> &
  Partial<PlotlyViolinData> &
  Partial<PlotlyPieData>;

/**
 * Trace configs
 */
// export type Trace = TraceConfig & TracePlotyData;

//Note: This is currently only used for plot app. Eventually this will be changed to a parameter from plot config. It could also be reused for other apps but we don't have a use case yet.
export const plotAreaFraction = 0.95;

//NOTE: Consider moving this threshold to the useWindowSize hook if it will be utilized by other webapps.
export const screenWidthThreshold = 1000;

//Valid file types for url_pattern
export const validFileTypes = ['csv','json'];
