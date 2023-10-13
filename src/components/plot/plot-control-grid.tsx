import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_heatmap.scss';

// hooks
import { useEffect, useState, useContext } from 'react';

// services
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { DataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
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
    const [valueKeys, setValueKeys] = useState<string[]>([]);
    const [dataOptions, setDataOptions] = useState<any>(null);
    const [userControlValues, setUserControlValues] = useState<string[]>([]);
    const templateParamsData = useContext(TemplateParamsContext);
    const [selectorOptionChanged, setSelectorOptionChanged] = useState<boolean>(false);
  
    const templateParams = templateParamsData.templateParams;
    console.log(templateParams,config);

  
    useEffect(()=>{
      if(config){
      const mappedLayoutValues = Object.values(config?.layout)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          //i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));
      setLayout(Object.fromEntries(Object.entries(config.layout).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
      setGridProps(convertKeysSnakeToCamel(config?.grid_layout_config));
      if(dataOptions && dataOptions.length>0){
      config?.user_controls?.map((currentConfig, index) => {
        const currUid = currentConfig?.uid;
        const currValueKey = currentConfig?.request_info.value_key;
        setValueKeys((preValueKeys)=>[...preValueKeys,currValueKey]);
        const selectedOption = dataOptions[index].find((option: Option) =>
            option.value === templateParams?.$control_values[currUid].values[currValueKey]);
        if (selectedOption) {
          setUserControlValues((values)=>[...values,selectedOption]);
        }
       
      });
    }    
      }
    },[config,dataOptions]);
    useControl({
      userControlConfig: config?.user_controls,
      templateParams,
      setDataOptions,
    });
    console.log('dataOptions: ', dataOptions,templateParams);
    console.log(config?.user_controls && config?.user_controls?.length > 0);
  
    return (
        !(config && dataOptions && dataOptions?.length>0) ? <ChaiseSpinner /> : 
        <div className='plot-page'>
        <ResponsiveGridLayout className='grid-layout layout'
          layouts={layout}
          {...gridProps}>
          {/* <div className='plot-page'> */}
          {config?.user_controls && config?.user_controls?.length > 0 && config?.user_controls?.map((currentConfig, index) => (
              <UserControl 
              key={currentConfig.uid} 
              userControlData={{controlConfig: currentConfig, templateParams: templateParams}} 
              controlOptions={dataOptions[index]} 
              setSelectorOptionChanged={setSelectorOptionChanged}/>
            ))}
            {config.plots.map((plotConfig): JSX.Element => {
              return <ChartWithEffect key={plotConfig.uid} config={plotConfig} />;
            })}
        </ResponsiveGridLayout>
        </div>
      );
}

export default PlotControlGrid;