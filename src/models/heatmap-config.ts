export type HeatmapConfigDefault = {
  data: HeatmapData,
  presentation: HeatmapPresentation,
};


export type HeatmapData = {
  titleColumn?: string,
  idColumn?: string,
  xColumn?: string,
  yColumn?: string,
  zColumn?: string,
  sortBy?: sortByType
};

export type sortByType = any

export type HeatmapPresentation = {
  width: number,
  xTickAngle: number,
  tickFontFamily: string,
  tickFontSize: number
}

export type HeatmapConfig = {
  '*': HeatmapConfigDefault;
};