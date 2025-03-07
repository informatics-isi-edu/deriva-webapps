// import '/node_modules/react-resizable/css/styles.css';
// import '/node_modules/react-grid-layout/css/styles.css';
import { memo, useEffect, useRef, useState, type JSX } from 'react';

// components
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';

// models
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps, Layouts } from 'react-grid-layout';
import { defaultGridProps, LayoutConfig, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// utils
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import useAlert from '@isrd-isi-edu/chaise/src/hooks/alerts';
import { validateControlData, validateDuplicateControlUID, validateLayout, validateUID } from '@isrd-isi-edu/deriva-webapps/src/utils/plot-utils';
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

type UserControlsGridProps = {
  /**
   * selectors data to be rendered
   */
  userControlData: {
    gridConfig: ResponsiveGridProps,
    layout: Layouts,
    userControlConfig: UserControlConfig[]
  };
  width: number | string;
  setSelectorOptionChanged: (optionChanged: boolean) => void;
  templateParams: PlotTemplateParams;
  setTemplateParams: (templateParams: PlotTemplateParams) => void;
};

// In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const UserControlsGrid = ({
  userControlData,
  width,
  setSelectorOptionChanged,
  templateParams,
  setTemplateParams
}: UserControlsGridProps): JSX.Element => {
  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState<ResponsiveGridProps>({});
  const [localControlData, setLocalControlData] = useState<any[]>(userControlData.userControlConfig);
  const [validationComplete, setValidationComplete] = useState<boolean>(false);
  const [localControlsReady, setLocalControlsReady] = useState<boolean>(false);

  const alertFunctions = useAlert();

  const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);
  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  /**
  * It should be called once to validate the configuration data for the user controls
  */
  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    if (localControlData?.length > 0) {
      //Validate local controls for uid and type. Display error if any control doesn't have an uid or type
      validateUID(localControlData, alertFunctions);
    }

    /*Validate local controls with same uid. Display error in case of same uid(s)
    * controlObject will be of the form {key_1: val_1, key_2: val_2, ..} where key is control uid and the value will be the control data.
    * Example of controlObject: {consort: {uid:"consort", label:"consortium", type:"dropdown", request_info:{...}}}*/
    const controlObject = validateDuplicateControlUID(localControlData, alertFunctions);

    // Validate controls for not having neither of the request_info.data nor the request_info.url_pattern and display error
    const validatedUserControls = validateControlData(Object.values(controlObject), alertFunctions);

    let tempLayout;
    let revalidatedUserControls;
    if (userControlData?.gridConfig?.layouts && Object.values(userControlData.gridConfig?.layouts)?.length > 0) {
      // Check if the layout parameter has all the necessary properties such as source_uid, h, w, x, and y. If any of these properties are missing, display a warning.
      const validatedLayoutObject = validateLayout(userControlData?.gridConfig?.layouts, validatedUserControls, alertFunctions);
      tempLayout = validatedLayoutObject.tempLayout;
      revalidatedUserControls = validatedLayoutObject.revalidatedUserControls;
    } else {

      const gridConfig = userControlData.gridConfig;
      // Default uid for local controls will be considered as eg. local_dropdown_0 for first local control
      const defaultControlUid: string[] = validatedUserControls?.map((control: UserControlConfig) => control.uid);
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig?.cols === 'number' && gridConfig?.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig?.cols && !columnNumber && Object.values(gridConfig?.cols) || Object.values(defaultGridProps.cols);
      const breakpointsApplied = gridConfig?.breakpoints || defaultGridProps.breakpoints;

      tempLayout = Object.fromEntries(Object.entries(breakpointsApplied).map(
        ([key]: any, index: number) => {
          return [key, defaultControlUid.map((id: string, ind: number) => {
            return {
              i: id,
              x: 0,
              y: ind,
              w: columnNumber ? columnNumber / 2 : defaultColumns[index] / 2,
              h: 1,
              static: true
            }
          })]
        }
      ))
    }
    setLayout(tempLayout);
    if (revalidatedUserControls && revalidatedUserControls?.length !== -1) {
      setLocalControlData(revalidatedUserControls);
    } else {
      setLocalControlData(validatedUserControls);
    }
    //To avoid react-grid-layout throwing unnecessary errors related to layout or UID
    setValidationComplete(true);
  }, []);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (userControlData.gridConfig) {
      setGridProps(validateGridProps(userControlData.gridConfig));
    }
  }, [userControlData.gridConfig]);


  const renderUserControls = () => {
    return (
      localControlData?.map((config: UserControlConfig) => ((<div key={config.uid}>
        <UserControl 
          controlConfig={config}
          setSelectorOptionChanged={setSelectorOptionChanged}
          templateParams={templateParams}
          setTemplateParams={setTemplateParams}
        />
      </div>
      )))
    );
  }

  return validationComplete ? (
    <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
      <ResponsiveGridLayout className='grid-layout layout' style={{ position: 'relative' }}
        // TODO: Look for another fix for overlapping issue in controls
        useCSSTransforms={false}
        {...defaultGridPropsConverted}
        {...gridProps}
        layouts={layout}
      >
        {localControlData?.length > 0 ? renderUserControls() : null}
      </ResponsiveGridLayout>
    </div>
  ) : <ChaiseSpinner />;

};

// only rerender component if props change but the props should NOT change, so this component shouldn't "rerender"
export default memo(UserControlsGrid);
