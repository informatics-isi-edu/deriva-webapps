export type PlotConfig = {
  [plotName: string]: PlotTypeConfig;
};

export type PlotTypeConfig = {
  page_title?: string;
  headTitle: string;
  top_right_link_text?: string;
  plots: Plot[];
};

export type Plot = {
  plot_type: string;
  config: PlotConfigConfig;
  traces: Trace[];
  plotlyDefaultButtonsToRemove?: string[];
  gene_uri_pattern?: string;
  study_uri_pattern?: string;
  plotly?: Plotly;
};

export type Plotly = {
  config: PlotlyConfig;
  layout: PlotlyLayout;
  data?: Data;
};

export type PlotlyConfig = {
  modeBarButtonsToRemove?: string[];
  displaylogo?: boolean;
  responsive?: boolean;
};

export type PlotlyLayout = {
  title: string;
  showLegend?: boolean;
  legend?: LayoutLegend;
  height?: number;
  width?: number;
  showlegend?: boolean;
  xaxis?: LayoutAxis;
  yaxis?: LayoutAxis;
  margin?: LayoutMargin;
  font?: Font;
  colorway?: string[];
};

export type LayoutAxis = {
  title?: string;
  type?: string;
  range?: number[];
  ticksuffix?: string;
};

export type LayoutMargin = {
  t?: number;
  r?: number;
  b?: number;
  l?: number;
};

export type LayoutLegend = {
  traceorder?: string;
  entrywidth?: number;
  entrywidthmode?: string;
  font?: Font;
  orientation?: string;
  x?: number;
  y?: number;
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
  group_keys?: PlotConfigXAxisGroupKey[];
  default_all_studies_group?: string;
};

export type PlotConfigXAxisGroupKey = {
  column_name: string;
  title_display_pattern: string;
  tick_display_markdown_pattern?: string;
  default?: boolean;
};

export type Trace = {
  uri?: string;
  data_col?: string;
  legend_col?: string;
  legend_markdown_pattern?: string | string[];
  graphic_link_pattern?: string[] | string;
  legend?: string[];
  x_col?: string[];
  y_col?: string[];
  orientation?: string;
  textfont?: Font;
  legendwidth?: number;
  queryPattern?: string;
};

export type Font = {
  size: number;
  family?: string;
}

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