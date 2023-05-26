import PlotlyChart from '@isrd-isi-edu/deriva-webapps/src/components/plot/plotly-chart';
import { PlotData, PlotlyLayout } from 'plotly.js-cartesian-dist-min'


export type PlotlyLayout = typeof PlotlyLayout;
export type PlotlyData = typeof PlotData;

export type HeatmapPlotProps = {
    data: PlotlyData,
    layout: PlotlyLayout,
};

const HeatmapPlot = ({
    data,
    layout,
  }: HeatmapPlotProps): JSX.Element => {
    return <PlotlyChart data={[data]}
      layout={layout}
    />;
  }

export default HeatmapPlot;