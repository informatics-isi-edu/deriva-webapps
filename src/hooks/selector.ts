import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { useState, useEffect } from 'react';

import { GridLayoutConfig, LayoutConfig, SelectorConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
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

/**
 * Fetch the data from the given uri for a select grid cell data
 * return the reference and tuple data received from the request
 *
 * @param uri
 * @param headers
 * @returns
 */
const fetchSelectGridCellData = async (uri: string, headers: any) => {
    // console.log('fetchselectgridcell occurred', uri);
    const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    const ref = resolvedRef.contextualize.compactSelect;
    const initialReference = resolvedRef.contextualize.compactSelect;
    const page = await ref.read(1);
    const tupleData = page.tuples;
    return { initialReference, tupleData };
};
const getDataOptions = async (selectorGridObject: SelectorsGridProps) => {
    if (selectorGridObject?.selectorConfig?.request_info?.url_pattern) {
        const pattern = selectorGridObject?.selectorConfig?.request_info?.url_pattern;
        console.log('template: ', selectorGridObject?.templateParams);
        const { uri, headers } = getPatternUri(pattern, selectorGridObject?.templateParams);
        console.log(uri);
        const { initialReference, tupleData } = await fetchSelectGridCellData(
            uri,
            headers
        ); // perform the data fetch
        return { initialReference, tupleData };
    } else {
        const dataOption = selectorGridObject?.selectorConfig?.request_info?.data;
        console.log(dataOption);
        const dropdownOptions: { label: any; value: any; }[] = [];
        dataOption?.map((option: any) => {
            dropdownOptions.push({ 'label': option.Display, 'value': option.Name });
        });
        return dropdownOptions;
    }
}

const changeSelectorData = (configData: any) => {
    const paramKey = configData.selectorConfig?.url_param_key;
    const uid = configData.selectorConfig.uid;
    const valueKey = configData.selectorConfig.request_info.value_key;
    const defaultValue = configData.selectorConfig.request_info.default_value;
    configData.templateParams.$control_values={
        [uid]: {
            values: {},
        },
    };
    console.log(configData.templateParams.$control_values);
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
    // const [dataOptions, setDataOptions] = useState<any>([]);
    const [dataOptionsLoading, setDataOptionsLoading] = useState<boolean>(false);
    const [selectorTemplateParams, setSelectorTemplateParams] = useState<any>({});


    console.log(configData.selectorConfig.request_info.value_key, configData.selectorConfig.request_info.default_value);
    useEffect(() => {
        changeSelectorData(configData);
        setSelectorTemplateParams(configData.templateParams);
        getDataOptions(configData).then((options) => {
            console.log('here are ', options);
            configData.setDataOptions(options);
        });
    }, [configData.selectorConfig]);
    console.log(configData.templateParams.$control_values);
    // let controlValues;
    // useEffect(() => {
    //     if (dataOptions?.length > 0 && configData.templateParams.$control_values) {
    //         controlValues = selectorTemplateParams.$control_values;
    //         console.log('uid ', controlValues[configData.selectorConfig.uid]?.values[configData.selectorConfig.request_info.value_key]);
    //     }
    // }, [dataOptions]);
    // console.log(dataOptions);
    // return dataOptions;
};
