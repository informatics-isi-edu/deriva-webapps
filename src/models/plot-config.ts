export type PlotConfig = {
  [plotName: string]: PlotTypeConfig;
};

export type PlotTypeConfig = {
  headTitle?: string;
  top_right_link_text?: string;
  plots: Plot[];
};

export type Plot = {
  plot_type: string;
  gene_uri_pattern?: string;
  study_uri_pattern?: string;
  plotly: Plotly;
  config: PlotConfigConfig;
  traces: Trace[];
};

export type Plotly = {
  config: PlotlyConfig;
  layout: PlotlyLayout;
};

export type PlotlyConfig = {
  modeBarButtonsToRemove?: string[];
  displaylogo?: boolean;
  responsive?: boolean;
};

export type PlotlyLayout = {
  title?: string;
  height?: number;
  width?: number;
  showLegend?: boolean;
  margin?: PlotlyMargin;
  xaxis?: PlotlyAxis;
  yaxis?: PlotlyAxis;
  legend?: PlotlyLegend;
};

export type PlotlyMargin = {
  t?: number;
  r?: number;
  b?: number;
  l?: number;
};

export type PlotlyAxis = {
  title?: string;
  type?: string;
  range?: number[];
  ticksuffix?: string;
};

export type PlotlyLegend = {
  traceorder?: string;
};

export type PlotConfigConfig = {
  title_display_markdown_pattern?: string;
  xaxis?: PlotConfigXAxis;
  yaxis?: PlotConfigYAxis;
  format_data?: boolean;
  format_data_x?: boolean;
  slice_label?: string;
};

export type PlotConfigXAxis = {
  group_keys?: PlotConfigXAxisGroupKey[];
  default_all_studies_group?: string;
};

export type PlotConfigXAxisGroupKey = {
  column_name: string;
  title_display_pattern?: string;
  tick_display_markdown_pattern?: string;
  default?: boolean;
};

export type PlotConfigYAxis = {
  title_display_markdown_pattern?: string;
  group_key?: string;
};

export type Trace = {
  uri?: string;
  queryPattern?: string;
  legend?: string[];
  data_col?: string;
  legend_col?: string;
  x_col?: string[];
  y_col?: string[];
  orientation?: string;
  textfont?: TraceTextfont;
};

export type TraceTextfont = {
  size?: number;
};
