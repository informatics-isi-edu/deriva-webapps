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
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';

// provider
import PlotlyChartProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plotly-chart';

// utils
import useAlert from '@isrd-isi-edu/chaise/src/hooks/alerts';
import { ChaiseError } from '@isrd-isi-edu/chaise/src/models/errors';
import { ChaiseAlertType } from '@isrd-isi-edu/chaise/src/providers/alerts';
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
  const [userControls, setUserControls] = useState<UserControlConfig[]>([]);
  const [validatedPlots, setValidatedPlots] = useState<Plot[]>(config.plots);
  const alertFunctions = useAlert();


  const { globalControlsInitialized, globalUserControlData, setConfig, templateParams } = usePlot();

  const gridContainer = useRef<HTMLDivElement | null>(null);

  const defaultGridPropsRef = useRef(convertKeysSnakeToCamel(defaultGridProps));

  useEffect(() => {
    setConfig(config);

    let userControlFlag = false;
    if (config.user_controls?.length > 0) {
      userControlFlag = true;
    }

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

    //Validate global controls for uid and type. Display error if any control doesn't have an uid or type
    if (userControlsExists && globalUserControlData?.userControlConfig?.length > 0) {
      const invalidControlType: string[] = [];
      globalUserControlData?.userControlConfig?.map((control: UserControlConfig) => {
        if (!control?.uid) {
          throw new ChaiseError('User Control Error', `Missing UID for the specified global user control  ${control?.label ? `labelled as "${control?.label}"` : ''}`);
        }
        if (!control?.type) {
          invalidControlType.push(control.uid);
        }
      });
      //Show single error for all uids with same issue
      if (invalidControlType.length > 0) {
        alertFunctions.addAlert(`Unable to display the global control with UID(s): ${invalidControlType.join(', ')} as the 'type' was not found for the control`, ChaiseAlertType.ERROR);
      }
    }

    //Validate global controls and plots with same uid. Display error in case of same uid(s)
    const uniqueUidControls: string[] = [];
    let controlObject: any = {};
    //Check if there are any same uid's within global controls. If yes. display appropriate error with the repeated uid
    if (globalUserControlData?.userControlConfig?.length > 0) {
      const dupUid: string[] = [];
      controlObject = globalUserControlData?.userControlConfig?.reduce((result: any, control: UserControlConfig) => {
        if (!uniqueUidControls?.includes(control.uid)) {
          uniqueUidControls.push(control.uid)
        } else {
          if (!dupUid?.includes(control.uid)) {
            dupUid.push(control.uid);
          }
        }
        result[control.uid] = control;
        return result;
      }, {});
      //Show single error for all uids with same issue
      if (dupUid?.length > 0) {
        dupUid.map((id) => alertFunctions.addAlert(`Multiple global controls with the same UID '${id}' were detected`, ChaiseAlertType.ERROR));
      }
    }
    //Then check if there are any same uid's between global controls and plots. If yes, display error with the repeated uid
    const uniqueUidPlots: string[] = [];
    const dupPlotUid: string[] = [];
    const plotObject = config.plots?.reduce((result: any, plot: Plot) => {
      if (uniqueUidControls?.includes(plot.uid)) {
        controlObject = Object.keys(controlObject).filter((controlKey: string) => controlKey !== plot.uid).reduce((res: any, key) => {
          res[key] = controlObject[key];
          return res;
        }, {});
        alertFunctions.addAlert(`Found a global control and a plot with the same UID '${plot.uid}'`, ChaiseAlertType.ERROR);
      } else if (uniqueUidPlots?.includes(plot.uid)) {
        if (!dupPlotUid?.includes(plot.uid)) {
          dupPlotUid.push(plot.uid);
        }
      } else {
        uniqueUidPlots.push(plot.uid);
      }
      result[plot.uid] = plot;
      return result;
    }, {});
    //Show single error for all uids with same issue
    if (dupPlotUid?.length > 0) {
      dupPlotUid.map((id) => alertFunctions.addAlert(`Multiple plots with same UID '${id}' were detected`, ChaiseAlertType.ERROR));
    }
    config.plots = Object.values(plotObject);
    if (Object.values(controlObject)?.length > 0) {
      setUserControls(Object.values(controlObject));
    }
    setValidatedPlots(Object.values(plotObject));


    // Validate controls for not having neither of the request_info.data nor the request_info.url_pattern and display error
    let validatedUserControls: UserControlConfig[] = [];
    if (userControlsExists) {
      const invalidControlData: string[] = [];
      validatedUserControls = globalUserControlData?.userControlConfig?.map((control: UserControlConfig) => {
        let isControlValid = true;
        if (!(control.request_info?.data && control.request_info?.data?.length > 0 || control.request_info.url_pattern)) {

          isControlValid = false;
          if (!alertFunctions.alerts.some(
            (alert) => alert.message.includes(`Unable to display the global control with UID '${control.uid}'`))) {
            invalidControlData.push(control.uid);
          }
        }
        return ({ ...control, visible: isControlValid });
      }).filter((control: UserControlConfig) => control.visible || control?.visible == undefined);
      //Show single error for all uids with same issue
      if (invalidControlData?.length > 0) {
        alertFunctions.addAlert(`Unable to display the global control with UID(s): ${invalidControlData.join(', ')} because neither the request_info.data nor the request_info.url_pattern were found`, ChaiseAlertType.WARNING);
      }
    }
    setUserControls(validatedUserControls);
  }, [globalControlsInitialized]);

  useEffect(()=>{
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
      ));

      // Check if the layout parameter has all the necessary properties such as source_uid, h, w, x, and y. If any of these properties are missing, display a warning.
      const invalidLayoutUid: string[] = [];
      tempLayout = Object.fromEntries(Object.entries(tempLayout).map(([layoutBPKey, layoutBPValue]) => {
        const newValue: Layout[] = (layoutBPValue as any[]).filter((val: any) => {
          if (!val?.sourceUid) {
            alertFunctions.addAlert(`Unable to display the component due to a missing 'source_uid' in layouts parameter for "${layoutBPKey}" breakpoint`, ChaiseAlertType.ERROR);
            return false;
          }
          //Not showing single error in this case as it's specific to a breakpoint
          if (!(val?.w !== 0 && val?.w !== undefined && val?.h !== 0 && val?.h !== undefined && val?.x !== undefined && val?.y !== undefined)) {
            alertFunctions.addAlert(`Unable to display the component with UID "${val.sourceUid}" due to a one of the required layout parameters missing(w, h, x, y) for "${layoutBPKey}" breakpoint`, ChaiseAlertType.WARNING);
            invalidLayoutUid.push(val.sourceUid);
            return false;
          }
          return true;
        });
        return [layoutBPKey, newValue];
      }));

      //Revalidate to filter out controls and plots with invalid layout
      const revalidatedUserControls = userControls?.map((control: UserControlConfig) => {
        let isControlValid = true;
        if (invalidLayoutUid.includes(control?.uid)) {
          isControlValid = false;
          return ({ ...control, visible: isControlValid });
        }
        return ({ ...control });
      }).filter((control) => control.visible || control?.visible == undefined);
      setValidatedPlots(config.plots.filter((plot: Plot) => !invalidLayoutUid.includes(plot.uid)));
      setUserControls(revalidatedUserControls);

    } else {
      // Otherwise set the default layout to display controls and plots 
      const gridConfig = config.grid_layout_config;
      const plotUids: string[] = validatedPlots?.map((plot: Plot) => plot.uid);
      const controlUids: string[] = userControls?.map((control: UserControlConfig) => control.uid);

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
            // Setting the plot default height to 15 to ensure that the container size accommodates all types of plots completely, 
            // preventing any overlapping in the content and to respect the plot generated by Plotly using given user configuration.
            h: controlUids?.includes(id) || onlyPlot ? 1 : 15,
            static: true,
          }
        })]
      ))
    }
    setLayout(tempLayout);
  },[userControls,validatedPlots]);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (config.grid_layout_config) {
      setGridProps(validateGridProps(config.grid_layout_config));
    }
  }, [config.grid_layout_config]);
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
            {validatedPlots.length > 0 ? validatedPlots?.map((plotConfig: Plot): JSX.Element => (
              <div key={plotConfig.uid}>
                <PlotlyChartProvider>
                  <ChartWithEffect config={plotConfig} />
                </PlotlyChartProvider>
              </div>
            )) : null}
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