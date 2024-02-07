import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';

// hooks
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { useEffect, useRef, useState } from 'react';

// models
import { DataConfig, LayoutConfig, Plot, UserControlConfig, defaultGridProps, globalGridMargin } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
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
  const [userControls, setUserControls] = useState<any[]>([]);

  const { globalControlsInitialized, globalUserControlData, setConfig, templateParams } = usePlot();

  const gridContainer = useRef<HTMLDivElement | null>(null);

  const defaultGridPropsRef = useRef(convertKeysSnakeToCamel(defaultGridProps));

  useEffect(() => {
    setConfig(config);

    let userControlFlag = false;
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
      // userControlConfig should exist if userControlsExists === true
      if (globalUserControlData.userControlConfig) setUserControls(globalUserControlData.userControlConfig);
      if (Object.keys(templateParams?.$control_values).length > 0) {
        setUserControlReady(true);
      }
    }

    let tempLayout;
    // If layout is configured use the given layout
    if (config.grid_layout_config?.layouts && Object.values(config.grid_layout_config?.layouts).length > 0) {
      const mappedLayoutValues = Object.values(config.grid_layout_config?.layouts)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          //i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));

      tempLayout = Object.fromEntries(Object.entries(config.grid_layout_config?.layouts).map(
        ([key]: any, index) => [key, mappedLayoutValues[index]]
      ))


    } else {
      // Otherwise set the default layout to display controls and plots 
      const gridConfig = config.grid_layout_config;
      const plotUids: string[] = config.plots.map((plot: Plot) => plot.uid);
      const controlUids: string[] = globalUserControlData?.userControlConfig?.map((control: UserControlConfig) => control.uid);
      const componentUids = controlUids ? [...controlUids, ...plotUids] : [...plotUids];
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig?.cols === 'number' && gridConfig?.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig?.cols && !columnNumber && Object.values(gridConfig?.cols) || Object.values(defaultGridPropsRef.current.cols);
      const breakpointsApplied = gridConfig?.breakpoints || defaultGridPropsRef.current.breakpoints;

      // There's only a plot with no layout defined
      let onlyPlot = false;
      if (componentUids.length === 1 && plotUids.length === 1) {
        // set this flag to communicate only component in ReactGridLayout will be 1 row with rowHeight = height of gridContainer
        onlyPlot = true;
        // update row height to the height of the container
        if (gridContainer.current?.clientHeight) defaultGridPropsRef.current.rowHeight = gridContainer.current?.clientHeight;
        // no padding needed when there are no other components
        defaultGridPropsRef.current.containerPadding = { lg: [0, 0], md: [0, 0], sm: [0, 0], xs: [0, 0] };
      }

      tempLayout = Object.fromEntries(Object.entries(breakpointsApplied).map(
        ([key]: any, index) => [key, componentUids.map((id, ind: number) => {
          return {
            i: id,
            x: 0,
            y: ind === 0 || controlUids?.includes(componentUids[ind - 1]) ? ind : ind + 14,
            w: columnNumber ? (controlUids?.includes(id) ? columnNumber / 2 : columnNumber) :
              controlUids?.includes(id) ? defaultColumns[index] / 2 : defaultColumns[index],
            h: controlUids?.includes(id) || onlyPlot ? 1 : 15,
            static: true,
          }
        })]
      ))
    }

    setLayout(tempLayout);
  }, [globalControlsInitialized]);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (config.grid_layout_config) {
      setGridProps(validateGridProps(config.grid_layout_config));
    }
  }, [config.grid_layout_config])

  return (
    <div className='plot-page'>
      <div className='grid-container' ref={gridContainer}>
        {(!config || !userControlsReady || Object.keys(layout).length === 0) ?
          <ChaiseSpinner /> :
          <ResponsiveGridLayout className='global-grid-layout layout'
            {...defaultGridPropsRef.current}
            margin={globalGridMargin}
            {...gridProps}
            layouts={layout}
          >
            {config.plots.map((plotConfig: Plot): JSX.Element => (
              <div key={plotConfig.uid}>
                <PlotlyChartProvider>
                  <ChartWithEffect config={plotConfig} />
                </PlotlyChartProvider>
              </div>
            ))}
            {userControls.length > 0 ?
              userControls.map((currentConfig: UserControlConfig): JSX.Element => (
                <div key={currentConfig.uid}>
                  <UserControl controlConfig={currentConfig} />
                </div>
              ))
              : null}
          </ResponsiveGridLayout>
        }
      </div>
    </div>
  );
}

export default PlotControlGrid;