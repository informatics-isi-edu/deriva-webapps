import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';

// hooks
import { useEffect, useState, useContext, useRef, useLayoutEffect } from 'react';

// services
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { DataConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import UserControlsGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/user-controls-grid';
import { useControl } from '@isrd-isi-edu/deriva-webapps/src/hooks/control';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { TemplateParamsContext } from '@isrd-isi-edu/deriva-webapps/src/components/plot/template-params';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
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

    const {templateParams} = useContext(TemplateParamsContext);

    useEffect(()=>{
      if(config){
        if(config?.layout && Object.values(config?.layout).length>0){
          const mappedLayoutValues = Object.values(config?.layout)?.map((resLayout: any) => (
            resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
              //i defines the item on which the given layout will be applied
              i: item?.source_uid,
              ...item,
            })))
          ));
          setLayout(Object.fromEntries(Object.entries(config.layout).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
        }else{
          const defaultPlotUid = config.plots.map((plot)=>{
              return plot.uid;
          });
          const currColumn = Object.values(defaultGridProps.cols);
          console.log(currColumn);
          setLayout(Object.fromEntries(Object.entries(defaultGridProps.breakpoints).map(([key]: any, index) => [key,defaultPlotUid.map((id,i)=>({
            i: id,
            x: 0,
            y: i,
            w: currColumn[index],
            h: 15,
            static: true,  
          }))])));
        }
        console.log(layout);
        setGridProps(convertKeysSnakeToCamel(config?.grid_layout_config));
    //   if(config?.user_controls?.length>0 && dataOptions && dataOptions.length>0){
    //   config?.user_controls?.map((currentConfig, index) => {
    //     const currUid = currentConfig?.uid;
    //     const currValueKey = currentConfig?.request_info.value_key;
    //     const selectedOption = dataOptions[index].find((option: Option) =>
    //         option.value === templateParams?.$control_values[currUid]?.values[currValueKey]);
    //     if (selectedOption) {
    //       setGlobalUserControlValues((values)=>[...values,selectedOption]);
    //     }
    //   });
    // }    
      }
    },[config,dataOptions]);
    useControl({
      userControlConfig: config?.user_controls,
      setDataOptions,
    });
    const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);
    console.log('dataOptions: ', dataOptions,templateParams);
    console.log(config?.user_controls && config?.user_controls?.length > 0);
    console.log('plots ',config.plots);
    if(!config || (config?.user_controls && config?.user_controls?.length > 0  && !(dataOptions && dataOptions.length>0))){
    return <ChaiseSpinner />;
    }
    return (
        <div className='plot-page'>
        <ResponsiveGridLayout className='global-grid-layout layout'
          layouts={layout}
          {...defaultGridPropsConverted}
          {...gridProps}>
          {config.plots.map((plotConfig): JSX.Element => {
              return <div key={plotConfig.uid}>
                <ChartWithEffect config={plotConfig}/>
                </div>;
          })}          
          {config?.user_controls && config?.user_controls?.length > 0 ? 
          dataOptions?.length>0 && config?.user_controls?.map((currentConfig, index) => (
              <div key={currentConfig.uid} style={{zIndex: 1}}>
              <UserControl 
              controlConfig={currentConfig} 
              controlOptions={dataOptions[index]} />
              </div>
          )): null}
        </ResponsiveGridLayout>
        {/* <ResponsiveGridLayout
        className='layout'
        layouts={{lg: [{ x: 0, y: 0, w: 1, h: 2, i: '1', static: true }, 
        { x: 1, y: 0, w: 2, h: 1, i: '2', static: true },
         { x: 3, y: 0, w: 2, h: 1, i: '3', static: true }]}}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        <div key="1" style={{backgroundColor: 'beige'}}>1</div>
        <div key="2" style={{backgroundColor: 'pink'}}>2</div>
        <div key="3" style={{backgroundColor: 'blue'}}>3</div>
      </ResponsiveGridLayout> */}
        </div>
      );
}

export default PlotControlGrid;