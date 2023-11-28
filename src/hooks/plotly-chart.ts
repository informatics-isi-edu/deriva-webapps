import { useContext } from 'react';
import { PlotlyChartContext } from '@isrd-isi-edu/deriva-webapps/src/providers/plotly-chart';

/**
 * usePlot hook to be used for accessing plot provider
 * can be used in sub-plot components to get the other plot data and control data
 * for list of properties take a look at PlotlyChartContext value
 */
function usePlotlyChart() {
  const context = useContext(PlotlyChartContext);
  if (!context) {
    throw new Error('No PlotlyChartProvider found when calling PlotlyChartContext');
  }
  return context;
}

export default usePlotlyChart;