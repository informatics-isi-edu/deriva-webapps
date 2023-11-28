import { useContext } from 'react';
import { PlotAppContext } from '@isrd-isi-edu/deriva-webapps/src/providers/plot-app';

/**
 * usePlot hook to be used for accessing plot provider
 * can be used in sub-plot components to get the other plot data and control data
 * for list of properties take a look at PlotAppContext value
 */
function usePlot() {
  const context = useContext(PlotAppContext);
  if (!context) {
    throw new Error('No PlotAppProvider found when calling PlotAppContext');
  }
  return context;
}

export default usePlot;