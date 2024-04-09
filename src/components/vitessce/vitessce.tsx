import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_vitessce.scss';
import { lazy, Suspense } from 'react';

// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';
const Vitessce = lazy(() => import('@isrd-isi-edu/deriva-webapps/src/components/vitessce/vitessce-wrapper'));

// hooks
import { useEffect, useRef, useState } from 'react';
import { useVitessce } from '@isrd-isi-edu/deriva-webapps/src/hooks/vitessce';

// models
import { defaultGridProps, globalGridMargin, LayoutConfig, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { DerivaVitessceDataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';

// utilities
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';



export type DerivaVitessceProps = {
  config: DerivaVitessceDataConfig;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const DerivaVitessce = ({
  config
}: DerivaVitessceProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  const [componentConfig, setComponentConfig] = useState<DerivaVitessceDataConfig['vitessce'] | null>(null);

  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState({});
  const [userControlsExists, setUserControlExists] = useState<boolean>(false);
  const [userControlsReady, setUserControlReady] = useState<boolean>(false);
  const [userControls, setUserControls] = useState<any[]>([]);

  const {
    globalControlsInitialized, globalUserControlData,
    setConfig, selectorOptionChanged, setSelectorOptionChanged,
    templateParams, setTemplateParams
  } = useVitessce();

  const gridContainer = useRef<HTMLDivElement | null>(null);

  const defaultGridPropsRef = useRef(convertKeysSnakeToCamel(defaultGridProps));

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    setConfig(config);

    let userControlFlag = false;
    if (config.user_controls?.length > 0) userControlFlag = true;

    setUserControlExists(userControlFlag);

    // If no controls are present we don't want to wait
    if (!userControlFlag) {
      setUserControlReady(true);
    }
  }, []);

  // copies the given config to a tempObject to do templating
  const _templateVitessceConfig = (config: DerivaVitessceDataConfig['vitessce']) => {
    const tempConfig = { ...config }
    tempConfig.datasets.forEach((dataset: any) => {
      dataset.files.forEach((file: any) => {
        if (file.url_pattern) {
          const { uri } = getPatternUri(file.url_pattern, templateParams);
          file.url = uri
        }
      })
    });

    return tempConfig;
  }

  useEffect(() => {
    if (!globalControlsInitialized) return;

    // once controls are set up and templateParams are available, update the config language and set up the react grid layout and vitessce app
    // check for `url_pattern` defined for each file to use as the `url`
    // if both are defined, `url_pattern` will replace `url`
    const tempConfig = _templateVitessceConfig(config.vitessce);

    // NOTE: The following is almost the same code that is in plot app
    if (userControlsExists && templateParams?.$control_values) {
      // userControlConfig should exist if userControlsExists === true
      if (globalUserControlData.userControlConfig) setUserControls(globalUserControlData.userControlConfig);
      if (Object.keys(templateParams?.$control_values).length > 0) {
        setUserControlReady(true);
      }
    }

    let tempLayout;
    // If layout is configured use the given layout
    if (config.grid_layout_config?.layouts && Object.values(config.grid_layout_config.layouts).length > 0) {
      const mappedLayoutValues = Object.values(config.grid_layout_config.layouts)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          //i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));

      tempLayout = Object.fromEntries(Object.entries(config.grid_layout_config.layouts).map(
        ([key]: any, index) => [key, mappedLayoutValues[index]]
      ))


    } else {
      // Otherwise set the default layout to display controls and vitessce
      const gridConfig = config.grid_layout_config;
      const vitessceUid: string = config.vitessce.uid;
      const controlUids: string[] = globalUserControlData?.userControlConfig?.map((control: UserControlConfig) => control.uid);
      const componentUids = controlUids ? [...controlUids, vitessceUid] : [vitessceUid];
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig?.cols === 'number' && gridConfig?.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig?.cols && !columnNumber && Object.values(gridConfig?.cols) || Object.values(defaultGridPropsRef.current.cols);
      const breakpointsApplied = gridConfig?.breakpoints || defaultGridPropsRef.current.breakpoints;

      // There's only a vitessce component with no layout defined
      let onlyVitessce = false;
      if (componentUids.length === 1 && vitessceUid) {
        // set this flag to communicate only component in ReactGridLayout will be 1 row with rowHeight = height of gridContainer
        onlyVitessce = true;
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
            h: controlUids?.includes(id) || onlyVitessce ? 1 : 15,
            static: true,
          }
        })]
      ))
    }

    setComponentConfig(tempConfig);

    setLayout(tempLayout);
  }, [globalControlsInitialized]);

  useEffect(() => {
    if (!selectorOptionChanged) return;
    setSelectorOptionChanged(false);

    const tempConfig = _templateVitessceConfig(config.vitessce);
    setComponentConfig(tempConfig);
  }, [selectorOptionChanged])

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (config.grid_layout_config) {
      setGridProps(validateGridProps(config.grid_layout_config));
    }
  }, [config.grid_layout_config])

  return (<div className='vitessce-page'>
    <div className='grid-container' ref={gridContainer}>
      {(!componentConfig || !userControlsReady || Object.keys(layout).length === 0) ?
        <ChaiseSpinner /> :
        <ResponsiveGridLayout className='global-grid-layout layout'
          {...defaultGridPropsRef.current}
          margin={globalGridMargin}
          {...gridProps}
          layouts={layout}
        >
          <div key={componentConfig.uid}>
            {selectorOptionChanged ?
              <ChaiseSpinner /> :
              /*
               * Changing componentConfig was not rerendering the vitessce component
               * instead changing the rendered component while componentConfig is being updated then
               * showing the vitessce component causes it to rerender and fetch with the new data
               */
              <Vitessce
                config={componentConfig}
                height={config.height || 800}
                // 'dark' has black backgrounds for each component
                // 'light' has grey backgrounds
                // no value has white backgrounds
                theme={config.theme || 'light'}
              />
            }
          </div>
          {userControls.length > 0 ?
            userControls.map((currentConfig: UserControlConfig): JSX.Element => (
              <div key={currentConfig.uid}>
                <UserControl
                  controlConfig={currentConfig}
                  setSelectorOptionChanged={setSelectorOptionChanged}
                  templateParams={templateParams}
                  setTemplateParams={setTemplateParams}
                />
              </div>
            ))
            : null}
        </ResponsiveGridLayout>
      }
    </div>
  </div>
  );
}

export default DerivaVitessce;