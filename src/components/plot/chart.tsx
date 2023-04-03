import { memo } from 'react';
import Plotly from 'plotly.js-cartesian-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import SelectGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-grid';

const PlotlyChart = createPlotlyComponent(Plotly);

export type ChartProps = {
  isLoading?: boolean;
  selectors?: any;
  plotlyProps: any;
};

const Chart = ({ selectors, plotlyProps }: ChartProps): JSX.Element => {
  return (
    <div className='chart'>
      {selectors && selectors.length > 0 ? (
        <SelectGrid selectors={selectors} maxWidth={plotlyProps.layout.width} />
      ) : null}
      <PlotlyChart className='plotly-chart' {...plotlyProps} />
    </div>
  );
};

export default memo(Chart);
