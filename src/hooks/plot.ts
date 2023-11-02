import { useContext } from 'react';
import { PlotContext } from '@isrd-isi-edu/deriva-webapps/src/providers/plot';

/**
 * usePlot hook to be used for accessing plot provider
 * can be used in sub-plot components to get the other plot data and control data
 * for list of properties take a look at PlotContext value
 */
function usePlot() {
  const context = useContext(PlotContext);
  if (!context) {
    throw new Error('No PlotProvider found when calling PlotContext');
  }
  return context;
}

export default usePlot;