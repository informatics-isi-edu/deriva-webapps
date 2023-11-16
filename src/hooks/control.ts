import { useEffect } from 'react';

import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

type UserControlGridProps = {
    /**
     * selectors data to be rendered
     */
    userControlConfig: UserControlConfig[];
    setDataOptions: any;
    setControlsReady?: any;
};

/**
 * This function retrieves dropdown options from its configuration, 
 * mapping them into an array of label-value pairs, and returns an array of arrays containing these options.
 * @param userControlGridObject Selector configuration, template params and setDataOptions state method
 * @returns array of arrays containing these options
 */
const getDataOptions = async (userControlGridObject: UserControlGridProps) => {
    //TODO: To fetch selector options from url_pattern
    // if (selectorGridObject?.selectorConfig?.request_info?.url_pattern) {
    //     const pattern = selectorGridObject?.selectorConfig?.request_info?.url_pattern;
    //     const { uri, headers } = getPatternUri(pattern, selectorGridObject?.templateParams);
    //     const { initialReference, tupleData } = await fetchSelectGridCellData(
    //         uri,
    //         headers
    //     ); // perform the data fetch
    //     return { initialReference, tupleData };
    // } else {
    const allSelectorDataOptions: Option[][] = [];
    userControlGridObject?.userControlConfig?.map((currentConfig) => {
        const dataOption = currentConfig?.request_info?.data;
        const dropdownOptions: { label: any; value: any; }[] = [];
        dataOption?.map((option: any) => {
            dropdownOptions.push({ 'label': option.Display, 'value': option.Name });
        });
        allSelectorDataOptions.push(dropdownOptions);
    })
    return allSelectorDataOptions;
    // }
}

/**
 * It iterates through its selectorConfig for multiple selectors. 
 * For each configuration, it extracts values for the selector and sets them in $control_values object within configData.templateParams under the selector's uid
 * and then returns the modified configData.templateParams.
 * @param configData Selector configuration, template params and setDataOptions state method
 * @returns modified configData.templateParams
 */
export const setControlData = (configData: UserControlConfig[], setTemplateParams: any) => {
    configData?.map((currentConfig: UserControlConfig) => {
        const paramKey = currentConfig?.url_param_key;
        const uid = currentConfig?.uid;
        const valueKey = currentConfig?.request_info?.value_key;
        const defaultValue = currentConfig?.request_info?.default_value;
        if (paramKey) {
            const paramValue = getQueryParam(windowRef.location.href, paramKey);
            if (paramValue) {
            setTemplateParams((prevTemplateParams: any)=>{
                return{
                    ...prevTemplateParams,
                    $control_values: {
                        ...prevTemplateParams.$control_values,
                        [uid]:{
                            values: {
                                [valueKey]: paramValue,
                            }
                        }
                    }
                }
            });
            }
        }
        if (defaultValue) {
            setTemplateParams((prevTemplateParams: any)=>{
                return{
                    ...prevTemplateParams,
                    $control_values: {
                        ...prevTemplateParams.$control_values,
                        [uid]:{
                            values: {
                                [valueKey]: defaultValue,
                            }
                        }
                    }
                }
            });
        } 
    })
}

/**
 * Hook function to handle the needed data to be used by the selectors
 *
 * @param configData Selector configuration, template params and setDataOptions state method
 */
export const useControl = (configData: UserControlGridProps) => {
    useEffect(() => {
        if(Object.values(configData).length>0){
        getDataOptions(configData).then((allDataOptions) => {
            configData.setDataOptions(allDataOptions);
        });
    }
    }, []);
};
