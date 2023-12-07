import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';

// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';

// hooks
import { useEffect, useState } from 'react';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// models
import { DataConfig, Plot, UserControlConfig, defaultGridProps, globalGridMargin } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';

// provider
import PlotlyChartProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plotly-chart';

// utils
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

export type PlotControlGridProps = {
  config: DataConfig,
};
const ResponsiveGridLayout = WidthProvider(Responsive);
/**
 * 
 * @param config config object for the given plot
 * @returns 
 */
const PlotControlGrid = ({
  config,
}: PlotControlGridProps): JSX.Element => {

  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState({});
  const [userControlsExists, setUserControlExists] = useState<boolean>(false);
  const [userControlsReady, setUserControlReady] = useState<boolean>(false);


  const { globalControlsInitialized, globalUserControlData, setConfig, templateParams } = usePlot();

  // set the controls data into the template params with the setControlData function
  useEffect(() => {
    setConfig(config);

    let userControlFlag = false;
    // TODO:
    // config.plots?.map((plotConfig) => {
    //   if (plotConfig?.user_controls?.length > 0) {
    //     userControlFlag = true;
    //     setControlData(plotConfig?.user_controls, setInitialParams, 'local');
    //   }
    // });

    if (config.user_controls?.length > 0) userControlFlag = true;

    setUserControlExists(userControlFlag);

    // If no controls are present we don't want to wait
    if (!userControlFlag) {
      setUserControlReady(true);
    }
  }, []);

  useEffect(() => {
    if (!globalControlsInitialized) return;

    if (userControlsExists && templateParams?.$control_values) {
      if (Object.keys(templateParams?.$control_values).length > 0) {
        setUserControlReady(true);
      }
    }

    // If layout is configured use the given layout
    if (config.layout && Object.values(config.layout).length > 0) {
      const mappedLayoutValues = Object.values(config.layout)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          //i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));

      const tempLayout = Object.fromEntries(Object.entries(config.layout).map(
        ([key]: any, index) => [key, mappedLayoutValues[index]]
      ))

      setLayout(tempLayout);
    } else {
      // Otherwise set the default layout to display controls and plots 
      const gridConfig = config.grid_layout_config;
      const defaultPlotUid: string[] = config.plots.map((plot: Plot, index: number) => {
        // Default uid will be considered as eg. bar_0 for first bar plot
        return plot.uid || plot.plot_type + '_' + index;
      });
      const defaultControlUid: string[] = config.user_controls?.map((control: UserControlConfig) => control.uid);
      const plotsControls = defaultControlUid ? [...defaultControlUid, ...defaultPlotUid] : [...defaultPlotUid];
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig?.cols === 'number' && gridConfig?.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig?.cols && !columnNumber && Object.values(gridConfig?.cols) || Object.values(defaultGridProps.cols);
      const breakpointsApplied = gridConfig?.breakpoints || defaultGridProps.breakpoints;

      const tempLayout = Object.fromEntries(Object.entries(breakpointsApplied).map(
        ([key]: any, index) => [key, plotsControls.map((id, ind: number) => {
          return {
            i: id,
            x: 0,
            y: ind === 0 || defaultControlUid?.includes(plotsControls[ind - 1]) ? ind : ind + 14,
            w: columnNumber ? (defaultControlUid?.includes(id) ? columnNumber / 2 : columnNumber) :
              defaultControlUid?.includes(id) ? defaultColumns[index] / 2 : defaultColumns[index],
            h: defaultControlUid?.includes(id) ? 1 : 15,
            static: true,
          }
        })]
      ))

      setLayout(tempLayout);
    }
  }, [globalControlsInitialized]);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (config.grid_layout_config) {
      setGridProps(validateGridProps(config.grid_layout_config));
    }
  }, [config.grid_layout_config])

  const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);

  if (!config || !userControlsReady || !layout) {
    return <ChaiseSpinner />;
  }

  return (
    <div className='plot-page'>
      <div className='grid-container'>
        <ResponsiveGridLayout className='global-grid-layout layout'
          layouts={layout}
          {...defaultGridPropsConverted}
          margin={globalGridMargin}
          {...gridProps}
        >
          {config.plots.map((plotConfig, i): JSX.Element => (
              <PlotlyChartProvider key={i}>
                <ChartWithEffect config={plotConfig} />
              </PlotlyChartProvider>
            )
          )}
          {globalUserControlData?.userControlConfig?.length > 0 ?
            globalUserControlData?.userControlConfig?.map((currentConfig: UserControlConfig, index: number) => (
              <div key={currentConfig.uid}>
                <UserControl
                  controlConfig={currentConfig}
                />
              </div>
            )) : null}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default PlotControlGrid;