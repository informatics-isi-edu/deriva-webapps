export type MatrixDefaultConfig = {
  xURL: string;
  xTreeURL?: string;
  yURL: string;
  yTreeURL?: string;
  zURL: string;
  xysURL: string;
  xFacetColumn: string;
  yFacetColumn: string;
  zFacetColumn: string;
  xSource: AxisSource;
  ySource: AxisSource;
  zSource: AxisSource;
  catalogId: string;
  schemaName: string;
  tableName: string;
  title_markdown: string;
  subtitle_markdown: string;
  styles?: MatrixStyles;
};

export type AxisSource = any;

export type MatrixStyles = {
  maxCols?: number;
  maxRows?: number;
  cellWidth?: number;
  cellHeight?: number;
  rowHeader?: RowHeaderStyles;
  columnHeader?: ColHeaderStyles;
  legendHeight?: number;
  legendBarWidth?: number;
  legendBarHeight?: number;
};

export type RowHeaderStyles = {
  width?: number;
  scrollable?: boolean;
  scrollableMaxWidth?: number;
};

export type ColHeaderStyles = {
  height?: number;
  scrollable?: boolean;
  scrollableMaxHeight?: number;
};

export type MatrixConfig = {
  '*': MatrixDefaultConfig;
};
