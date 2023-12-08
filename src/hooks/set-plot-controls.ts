// import { useEffect } from 'react';

// import { ControlScope, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
// import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
// import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';
// import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

// type UserControlGridProps = {
//     /**
//      * selectors data to be rendered
//      */
//     userControlConfig: UserControlConfig[];
//     setDataOptions: any;
// };

// /**
//  * Hook function to handle the needed data to be used by the selectors
//  *
//  * @param configData Selector configuration, template params and setDataOptions state method
//  */
// // export const useControl = (config) => {
//     const [dataOptions, setDataOptions] = useState<any>(null);
//     const [userControls, setUserControls] = useState<any>(null);
//     const [userControlsExists, setUserControlExists] = useState<boolean>(false);
//     const [userControlsReady, setUserControlReady] = useState<boolean>(false);
//     useEffect(() => {
//         let userControlFlag = false;
//         config.plots?.map((plotConfig: any) => {
//           if (plotConfig?.user_controls?.length > 0) {
//             userControlFlag = true;
//             // setControlData(plotConfig?.user_controls, setInitialParams, 'local');
//           }
//         });
//         if(config?.user_controls?.length>0){
//             userControlFlag = true;
//             // setControlData(config.user_controls, setInitialParams, 'global');
//         }
//         setUserControlExists(userControlFlag);
//         //If no controls are present we don't want to wait
//         if (!userControlFlag) {
//           setUserControlReady(true);
//         }
//       }, []);
    
//       //Set userControlsReady to true only if initial template params are updated with control values object.
//       useEffect(() => {
//         if (userControlsExists && initialParams?.$control_values) {
//           const controlValuesKeys = Object.keys(initialParams?.$control_values);
//           if (controlValuesKeys.length > 0) {
//             setUserControlReady(true);
//           }
//         }
//       }, [initialParams]);
    
//       //Set dataoptions for common controls with useControl hook
//       useControl({
//         userControlConfig: config?.user_controls,
//         setDataOptions,
//       });
// };

