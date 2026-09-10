/*
 * types come from plotly.js itself (it ships them as of v4) rather than from @types/plotly.js,
 * which DefinitelyTyped no longer keeps in step. the names differ: what DefinitelyTyped called
 * PlotData is ScatterData upstream. `import type` keeps plotly.js out of the bundle, we only
 * ever load the cartesian dist at runtime.
 */
import type {
  BarData as PlotlyBarData,
  Config as PlotlyConfig,
  HeatmapData as PlotlyHeatmapData,
  HistogramData as PlotlyHistogramData,
  Layout as PlotlyLayout,
  PieData as PlotlyPieData,
  ScatterData as PlotlyScatterData,
  ViolinData as PlotlyViolinData,
} from 'plotly.js';

import { LayoutConfig, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { Layouts, ResponsiveProps as ResponsiveGridConfig } from 'react-grid-layout';


/**
 * Config file for the plot
 */
export type PlotConfig = {
  [name: string]: DataConfig;
};

/**
 * Allowed AppStyle
 */
export enum AppStyle {
  WIDTH='width',
  MAX_WIDTH='max_width',
  MAX_HEIGHT='max_height',
}

/**
 * AppStyle Config
 */
export type AppStyleConfig = {
  width: number;
  max_width: string;
  max_height: string;
}

/**
 * Data
 */
export type DataConfig = {
  app_styles?: AppStyleConfig;
  plots: Plot[];
  layout: Layouts;
  grid_layout_config?: ResponsiveGridConfig;
  user_controls: UserControlConfig[];
};

/**
 * Specific plot
 */
export type Plot = {
  plot_type: string;
  config: PlotConfigConfig;
  layout: Layouts;
  grid_layout_config?: ResponsiveGridConfig;
  traces: Trace[];
  gene_uri_pattern?: string;
  study_uri_pattern?: string;
  plotly?: Plotly;
  user_controls: UserControlConfig[]; //A control can be of any type, but only dropdowns are implemented in current version
  uid: string;
};

/**
 * Plotly specific options
 */
export type Plotly = {
  config: PlotlyConfig;
  layout: PlotlyLayout;
  data: TracePlotyData[];
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
  slice_label?: PlotlyPieData['textinfo'];
  x_axis_thousands_separator?: boolean;
  xbins?: number;
  ybins?: number;
  textinfo?: string;
  modeBarButtonsToRemove?: string[];
  displaylogo?: boolean;
  responsive?: boolean;
  text_on_plot?: boolean;
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
  x_col_pattern?: string[];
  y_col_pattern?: string[];
  z_col_pattern?: string[];
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
 * Responsive Layout config
 */
export type ResponsiveLayoutConfig =
  {
    lg: LayoutConfig[];
    md: LayoutConfig[];
    sm: LayoutConfig[];
    xs: LayoutConfig[];
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
 * Trace data.
 *
 * one trace object has to satisfy whichever plot_type it belongs to, so this is the union of
 * every trace type the plot app supports. plotly.js's own types are per-trace (unlike the
 * catch-all PlotData that @types/plotly.js used to expose), so heatmap's `z` and pie's `values`
 * only type-check if their trace types are listed here.
 */
export type TracePlotyData = Partial<PlotlyScatterData> &
  Partial<PlotlyBarData> &
  Partial<PlotlyHistogramData> &
  Partial<PlotlyHeatmapData> &
  Partial<PlotlyViolinData> &
  Partial<PlotlyPieData>;


export type PlotTemplateParams = {
  $row?: {
    [paramKey: string]: any;
  };
  $self?: {
    [paramKey: string]: any;
  };
  /**
   * Parameters for URL 
   */
  $url_parameters: {
    [paramKey: string]: any;
  };
  $control_values: {
    [paramKey: string]: any;
  };
};

/**
 * Trace configs
 */
// export type Trace = TraceConfig & TracePlotyData;

//Note: This is used for each plot container and for the whole plot-app as default in case if 'width' is not given in the config.
export const plotAreaFraction = 0.95;

//NOTE: Consider moving this threshold to the useWindowSize hook if it will be utilized by other webapps.
export const screenWidthThreshold = 1000;

//Valid file types for url_pattern
export const validFileTypes = ['csv', 'json'];

