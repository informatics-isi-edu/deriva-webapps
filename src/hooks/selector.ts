import { useEffect } from 'react';

import { SelectorConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

type SelectorsGridProps = {
    /**
     * selectors data to be rendered
     */
    selectorConfig: SelectorConfig[];
    templateParams: PlotTemplateParams;
    setDataOptions: any;
};


const getDataOptions = async (selectorGridObject: SelectorsGridProps) => {
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
        const allSelectorDataOptions: (Option[] | undefined)[]=[];
        selectorGridObject?.selectorConfig?.map((currentConfig)=>{
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

const changeSelectorData = (configData: any) => {
    configData.selectorConfig.map((currentConfig: SelectorConfig)=>{
        const paramKey = currentConfig?.url_param_key;
        const uid = currentConfig?.uid;
        const valueKey = currentConfig?.request_info?.value_key;
        const defaultValue = currentConfig?.request_info?.default_value;
        configData.templateParams.$control_values={
            ...configData.templateParams.$control_values,
            [uid]: {
                values: {},
            },
        };
        if (paramKey) {
            const paramValue = getQueryParam(windowRef.location.href, paramKey);
            if (paramValue) {
                configData.templateParams.$control_values[uid].values = {
                    [valueKey]: paramValue //use url_param value
                };
            }
        }
        if (defaultValue) {
            configData.templateParams.$control_values[uid].values = {
                [valueKey]: defaultValue //else use default value
            };
        }
    })
    return configData.templateParams;
}
export const useSelector = (configData: any) => {
    useEffect(() => {
        changeSelectorData(configData);
        getDataOptions(configData).then((allDataOptions) => {
            configData.setDataOptions(allDataOptions);
        });
    }, [configData.selectorConfig]);
};
