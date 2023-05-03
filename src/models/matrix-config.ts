export type MatrixDefaultConfig = {
  xURL: string;
  yURL: string;
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
  rowHeaderWidth?: number;
  colHeaderHeight?: number;
  legendHeight?: number;
  legendBarWidth?: number;
  legendBarHeight?: number;
};

export type MatrixConfig = {
  '*': MatrixDefaultConfig;
};
