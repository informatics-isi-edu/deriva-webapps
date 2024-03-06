// import '/node_modules/react-resizable/css/styles.css';
// import '/node_modules/react-grid-layout/css/styles.css';
import { memo, useEffect, useRef, useState } from 'react';

// components
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';

// models
import { LayoutConfig, UserControlConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { Layout, Layouts, Responsive, ResponsiveProps as ResponsiveGridProps, WidthProvider } from 'react-grid-layout';

// utils
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import useAlert from '@isrd-isi-edu/chaise/src/hooks/alerts';
import { ChaiseError } from '@isrd-isi-edu/chaise/src/models/errors';
import { ChaiseAlertType } from '@isrd-isi-edu/chaise/src/providers/alerts';
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
};

// In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const UserControlsGrid = ({
  userControlData,
  width
}: UserControlsGridProps): JSX.Element => {
  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState<ResponsiveGridProps>({});
  const [localControlData, setLocalControlData] = useState<any[]>(userControlData.userControlConfig);
  const [validationComplete, setValidationComplete] = useState<boolean>(false);

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
      const invalidControlUid: string[] = [];
      userControlData?.userControlConfig?.map((control: UserControlConfig) => {
        if (!control?.uid) {
          throw new ChaiseError('User Control Error', `Missing UID for the specified global user control  ${control?.label ? `labelled as "${control?.label}"` : ''}`);
        }
        if (!control?.type) {
          invalidControlUid.push(control.uid);
        }
      });
      if (invalidControlUid.length > 0) {
        alertFunctions.addAlert(`Unable to display the local control with Uid(s) '${invalidControlUid.join(', ')}' as the 'type' was not found for the control`, ChaiseAlertType.ERROR);
      }
    }

    //Validate local controls with same uid. Display error in case of same uid(s)
    const uniqueUid: string[] = [];
    const dupUid: string[] = [];
    const controlObject = localControlData.reduce((result, control) => {
      if (!uniqueUid?.includes(control.uid)) {
        uniqueUid.push(control.uid)
      } else {
        if (!dupUid?.includes(control.uid)) {
          dupUid.push(control.uid);
        }
      }
      result[control.uid] = control;
      return result;
    }, {});
    if (dupUid?.length > 0) {
      dupUid.map((id) => alertFunctions.addAlert(`Multiple local controls with the same UID '${id}' were detected`, ChaiseAlertType.ERROR));
    }
    userControlData.userControlConfig = Object.values(controlObject);
    setLocalControlData(Object.values(controlObject));

    // Validate controls for not having neither of the request_info.data nor the request_info.url_pattern and display error
    const invalidControlData: string[] = [];
    const validatedUserControls = userControlData.userControlConfig?.map((control: UserControlConfig) => {
      let isControlValid = true;
      if (!((control.request_info?.data && control.request_info?.data?.length > 0) || control.request_info?.url_pattern)) {
        isControlValid = false;
        if (!alertFunctions.alerts.some(
          (alert) => alert.message.includes(`Unable to display the local control with Uid '${control.uid}'`))) {
          invalidControlData.push(control.uid);
        }
      }
      return ({ ...control, visible: isControlValid });
    }).filter((control) => control.visible || control?.visible == undefined);
    if (invalidControlData?.length > 0) {
      alertFunctions.addAlert(`Unable to display the local control with Uid(s): ${invalidControlData.join(', ')} because neither the request_info.data nor the request_info.url_pattern were found`, ChaiseAlertType.WARNING);
    }
    setLocalControlData(validatedUserControls);

    if (userControlData?.gridConfig?.layouts && Object.values(userControlData.gridConfig?.layouts)?.length > 0) {
      const mappedLayoutValues = Object.values(userControlData.gridConfig?.layouts)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          // i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));
      let tempLayout;
      tempLayout = Object.fromEntries(Object.entries(userControlData.gridConfig?.layouts).map(([key]: any, index) => [key, mappedLayoutValues[index]]));
      const invalidLayoutUid: string[] = [];

      // Check if the layout parameter has all the necessary properties such as source_uid, h, w, x, and y. If any of these properties are missing, display a warning.
      tempLayout = Object.fromEntries(Object.entries(tempLayout).map(([layoutBPKey, layoutBPValue]) => {
        const newValue: Layout[] = (layoutBPValue as any[]).filter((val: any) => {
          if (!val?.sourceUid) {
            alertFunctions.addAlert(`Unable to display the local control due to a missing 'source_uid' in layouts parameter for "${layoutBPKey}" breakpoint`, ChaiseAlertType.WARNING);
            return false;
          }
          //Not showing single error in this case as it's specific to a breakpoint
          if (!(val?.w !== 0 && val?.w !== undefined && val?.h !== 0 && val?.h !== undefined && val?.x !== undefined && val?.y !== undefined)) {
            alertFunctions.addAlert(`Unable to display the local control with Uid "${val.sourceUid}" due to a one of the required layout parameters missing(w, h, x, y) for "${layoutBPKey}" breakpoint`, ChaiseAlertType.WARNING);
            invalidLayoutUid.push(val.sourceUid);
            return false;
          }
          return true;
        });
        return [layoutBPKey, newValue];
      }));

      //Revalidate to filter out controls with invalid layout
      const revalidatedUserControls = validatedUserControls?.map((control: UserControlConfig) => {
        let isControlValid = true;
        if (invalidLayoutUid.includes(control?.uid)) {
          isControlValid = false;
          return ({ ...control, visible: isControlValid });
        }
        return ({ ...control });
      }).filter((control) => control.visible || control?.visible == undefined);
      setLocalControlData(revalidatedUserControls);
      setLayout(tempLayout);
    } else {

      const gridConfig = userControlData.gridConfig;
      // Default uid for local controls will be considered as eg. local_dropdown_0 for first local control
      const defaultControlUid: string[] = localControlData.map((control: UserControlConfig) => control.uid);
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig?.cols === 'number' && gridConfig?.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig?.cols && !columnNumber && Object.values(gridConfig?.cols) || Object.values(defaultGridProps.cols);
      const breakpointsApplied = gridConfig?.breakpoints || defaultGridProps.breakpoints;

      const tempLayout = Object.fromEntries(Object.entries(breakpointsApplied).map(
        ([key]: any, index: number) => {
          return [key, defaultControlUid.map((id: string, ind: number) => {
            return {
              i: id,
              x: ind % 2 === 0 ? 0 : ind + (columnNumber ? columnNumber / 2 : defaultColumns[index] / 2),
              y: Math.floor(ind / 2),
              w: columnNumber ? columnNumber / 2 : defaultColumns[index] / 2,
              h: 1,
              static: true
            }
          })]
        }
      ))
      setLayout(tempLayout);
    }
    //To avoid react-grid-layout throwing unnecessary errors related to layout or UID
    setValidationComplete(true);
  }, []);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (userControlData.gridConfig) {
      setGridProps(validateGridProps(userControlData.gridConfig));
    }
  }, [userControlData.gridConfig])

  const renderUserControls = () => {
    return (
      localControlData?.map((config: UserControlConfig) => ((<div key={config.uid}>
        <UserControl controlConfig={config} />
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
