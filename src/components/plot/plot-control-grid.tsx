import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';

// hooks
import { useEffect, useState } from 'react';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
// services
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { DataConfig, UserControlConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { convertKeysSnakeToCamel, generateUid, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { setControlData, useControl } from '@isrd-isi-edu/deriva-webapps/src/hooks/control';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/plot/user-control';



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
  const [dataOptions, setDataOptions] = useState<any>(null);
  const [userControls, setUserControls] = useState<any>(null);
  const [userControlsExists, setUserControlExists] = useState<boolean>(false);
  const [userControlsReady, setUserControlReady] = useState<boolean>(false);
  const [initialParams, setInitialParams] = useState<any>({
    $url_parameters: {
      Gene: {
        data: {
          NCBI_GeneID: 1, // TODO: deal with default value
        },
      },
      Study: [],
    },
    $control_values: {},
    noData: false
  });

  useEffect(() => {
    if (config) {
      //If layout is configured use the given layout
      if (config?.layout && Object.values(config?.layout).length > 0) {
        const mappedLayoutValues = Object.values(config?.layout)?.map((resLayout: any) => (
          resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
            //i defines the item on which the given layout will be applied
            i: item?.source_uid,
            ...item,
          })))
        ));
        setLayout(Object.fromEntries(Object.entries(config.layout).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
      }
      //Otherwise set the default layout to display controls and plots 
      else {
        const defaultPlotUid = config.plots.map((plot,index) => {
          return plot.uid || plot.plot_type+'_'+index; //Default uid will be considered as eg. bar_0 for first bar plot
        });
        const defaultControlUid = config.user_controls?.map((control,index) => {
          return control.uid || 'global_'+control.type+'_'+index; //Default uid for global controls will be considered as eg. global_dropdown_0 for first global control
        });
        
        const plotsControls = defaultControlUid ? [...defaultControlUid,...defaultPlotUid] : [...defaultPlotUid];
        const columnNumber = typeof config?.grid_layout_config?.cols === 'number' && config?.grid_layout_config?.cols;
        const defaultColumns = config?.grid_layout_config?.cols && !columnNumber &&  Object.values(config?.grid_layout_config?.cols) 
                              || Object.values(defaultGridProps.cols);
        const breakpointsApplied = config?.grid_layout_config?.breakpoints || defaultGridProps.breakpoints;

        setLayout(Object.fromEntries(Object.entries(breakpointsApplied).map(([key]: any, index) => [key, plotsControls.map((id, ind:number) => {
          return {
          i: id,
          x: 0,
          y: ind===0 || defaultControlUid?.includes(plotsControls[ind-1]) ? ind : ind + 14,
          w: columnNumber ? (defaultControlUid?.includes(id) ? columnNumber/2 : columnNumber) : 
          defaultControlUid?.includes(id) ? defaultColumns[index]/2 : defaultColumns[index],
          h: defaultControlUid?.includes(id) ? 1 : 15,
          static: true,
        }})])));
      }
    } 
  }, [config, dataOptions]);

  //Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(()=>{
    if(config?.user_controls?.length>0){
      setUserControls(generateUid(config?.user_controls,'global'));
    }
    if(config?.grid_layout_config){
      setGridProps(validateGridProps(config?.grid_layout_config));
    }
  },[config])

  //set the controls data into the template params with the setControlData function
  useEffect(() => {
    let userControlFlag = false;
    config.plots?.map((plotConfig) => {
      if (plotConfig?.user_controls?.length > 0) {
        userControlFlag = true;
        setControlData(plotConfig?.user_controls, setInitialParams, 'local');
      }
    });
    if(config?.user_controls?.length>0){
        userControlFlag = true;
        setControlData(config.user_controls, setInitialParams, 'global');
    }
    setUserControlExists(userControlFlag);
    //If no controls are present we don't want to wait
    if (!userControlFlag) {
      setUserControlReady(true);
    }
  }, []);

  //Set userControlsReady to true only if initial template params are updated with control values object.
  useEffect(() => {
    if (userControlsExists && initialParams?.$control_values) {
      const controlValuesKeys = Object.keys(initialParams?.$control_values);
      if (controlValuesKeys.length > 0) {
        setUserControlReady(true);
      }
    }
  }, [initialParams]);

  //Set dataoptions for common controls with useControl hook
  useControl({
    userControlConfig: config?.user_controls,
    setDataOptions,
  });

  const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);

  if (!config ||
    (userControls?.length>0 && !(dataOptions && dataOptions.length > 0)) ||
    !userControlsReady
    ) {
    return <ChaiseSpinner />;
  }
  return (
    <div className='plot-page'>
      <div className='grid-container'>
      <ResponsiveGridLayout className='global-grid-layout layout'
        layouts={layout}
        {...defaultGridPropsConverted}
        // margin={globalGridMargin}
        {...gridProps}>
        {config.plots.map((plotConfig): JSX.Element => {
          return <div key={plotConfig.uid}>
            <ChartWithEffect config={plotConfig} initialParams={initialParams} />
          </div>;
        })}
        {userControls?.length>0 ?
          dataOptions?.length > 0 && userControls?.map((currentConfig:UserControlConfig, index:number) => (
            <div key={currentConfig.uid}>
              <UserControl
                controlConfig={currentConfig}
                controlOptions={dataOptions[index]}
                // controlIndex={index}
                // controlScope='global' 
                />
            </div>
          )) : null}
      </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default PlotControlGrid;