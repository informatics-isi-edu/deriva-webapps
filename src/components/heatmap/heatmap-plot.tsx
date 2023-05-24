import PlotlyChart from "../plot/plotly-chart";


export type HeatmapPlotProps = {
    data: any,
    layout: any,
};

const HeatmapPlot = ({
    data,
    layout,
  }: HeatmapPlotProps): JSX.Element => {
    return <PlotlyChart data={[data.rows]}
      layout={{
        ...layout,
        //For enabling icons Toggle spike lines, Show closest data and compare data on hover
        modebar: {
        add: ['togglespikelines','v1hovermode'],
        },
      }}
    />;
  }

export default HeatmapPlot;