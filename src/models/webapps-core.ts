export type UserControlDataConfig = {
  Name: string;
  Display: string;
}

export type UserControlConfig = {
  uid: string;
  label: string;
  type: string;
  url_param_key?: string;
  request_info: UserControlRequestInfoConfig;
}

export type ControlScope = 'global' | 'local';

export type UserControlRequestInfoConfig = {
  url_pattern?: string;
  data?: UserControlDataConfig[];
  default_value?: string;
  value_key: string;
  selected_value_pattern?: string;
  tick_markdown_pattern: string;
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

//Default grid layout object to supply to the ResponsiveGridLayout if no grid configuration is provided in the config file
export const defaultGridProps = {
  auto_size: true,
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4 },
  margin: { lg: [10, 10], md: [10, 10], sm: [5, 5], xs: [5, 5] },
  container_padding: { lg: [12, 12], md: [10, 10], sm: [0, 0], xs: [0, 0] },
  row_height: 30,
};

export const globalGridMargin = { lg: [15, 5], md: [15, 5], sm: [5, 5], xs: [5, 5] };