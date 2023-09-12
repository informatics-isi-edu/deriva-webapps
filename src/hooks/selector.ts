import { useEffect } from 'react';

import { SelectorConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/chaise/src/utils/window-ref';

type SelectorsGridProps = {
    /**
     * selectors data to be rendered
     */
    selectorConfig: SelectorConfig;
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
        const dataOption = selectorGridObject?.selectorConfig?.request_info?.data;
        const dropdownOptions: { label: any; value: any; }[] = [];
        dataOption?.map((option: any) => {
            dropdownOptions.push({ 'label': option.Display, 'value': option.Name });
        });
        return dropdownOptions;
    // }
}

const changeSelectorData = (configData: any) => {
    const paramKey = configData.selectorConfig?.url_param_key;
    const uid = configData.selectorConfig?.uid;
    const valueKey = configData.selectorConfig?.request_info?.value_key;
    const defaultValue = configData.selectorConfig?.request_info?.default_value;
    configData.templateParams.$control_values={
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
    return configData.templateParams;
}
export const useSelector = (configData: any) => {
    useEffect(() => {
        changeSelectorData(configData);
        getDataOptions(configData).then((options) => {
            configData.setDataOptions(options);
        });
    }, [configData.selectorConfig]);
};
