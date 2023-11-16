import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';

// hooks
import { useEffect, useState } from 'react';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
// services
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { DataConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { setControlData, useControl } from '@isrd-isi-edu/deriva-webapps/src/hooks/control';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/plot/user-control';



export type PlotControlGridProps = {
  config: DataConfig,
};
const ResponsiveGridLayout = WidthProvider(Responsive);

const PlotControlGrid = ({
  config,
}: PlotControlGridProps): JSX.Element => {

  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState({});
  const [dataOptions, setDataOptions] = useState<any>(null);
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
      if (config?.layout && Object.values(config?.layout).length > 0) {
        const mappedLayoutValues = Object.values(config?.layout)?.map((resLayout: any) => (
          resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
            //i defines the item on which the given layout will be applied
            i: item?.source_uid,
            ...item,
          })))
        ));
        setLayout(Object.fromEntries(Object.entries(config.layout).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
      } else {
        const defaultPlotUid = config.plots.map((plot) => {
          return plot.uid;
        });
        const defaultControlUid = config.user_controls?.map((control) => {
          return control.uid;
        });
        let plotsControls:string[];
        if(defaultControlUid){
          plotsControls = [...defaultControlUid,...defaultPlotUid];
        }else{
          plotsControls = [...defaultPlotUid];
        }
        const columnNumber = typeof config?.grid_layout_config?.cols === 'number' && config?.grid_layout_config?.cols;
        const defaultColumns = config?.grid_layout_config?.cols && !columnNumber &&  Object.values(config?.grid_layout_config?.cols) 
                              || Object.values(defaultGridProps.cols);
        const breakpointsApplied = config?.grid_layout_config?.breakpoints || defaultGridProps.breakpoints;

        plotsControls.map((id, ind:number)=> console.log(id, ' - ', ind));
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
  useEffect(()=>{
    if(config?.grid_layout_config){
      setGridProps(validateGridProps(config?.grid_layout_config));
    }
  },[config])

  useEffect(() => {
    let userControlFlag = false;
    config.plots?.map((plotConfig) => {
      if (plotConfig?.user_controls?.length > 0) {
        userControlFlag = true;
        setControlData(plotConfig?.user_controls, setInitialParams);
      }
    });
    if(config?.user_controls?.length>0){
        userControlFlag = true;
        setControlData(config.user_controls, setInitialParams);
    }
    setUserControlExists(userControlFlag);
    if (!userControlFlag) {
      setUserControlReady(true);
    }
  }, []);

  useEffect(() => {
    if (userControlsExists && initialParams?.$control_values) {
      const controlValuesKeys = Object.keys(initialParams?.$control_values);
      if (controlValuesKeys.length > 0) {
        setUserControlReady(true);
      }
    }
  }, [initialParams]);

  useControl({
    userControlConfig: config?.user_controls,
    setDataOptions,
  });

  const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);
  if (!config ||
    (config?.user_controls && config?.user_controls?.length > 0 && !(dataOptions && dataOptions.length > 0)) ||
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
        {...gridProps}>
        {config.plots.map((plotConfig): JSX.Element => {
          return <div key={plotConfig.uid}>
            <ChartWithEffect config={plotConfig} initialParams={initialParams} />
          </div>;
        })}
        {config?.user_controls && config?.user_controls?.length > 0 ?
          dataOptions?.length > 0 && config?.user_controls?.map((currentConfig, index) => (
            <div key={currentConfig.uid} style={{ zIndex: 1 }}>
              <UserControl
                controlConfig={currentConfig}
                controlOptions={dataOptions[index]} />
            </div>
          )) : null}
      </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default PlotControlGrid;