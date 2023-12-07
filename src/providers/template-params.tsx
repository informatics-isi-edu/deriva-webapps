import { useState, ReactNode } from 'react';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { createContext } from 'react';

type TemplateParamsProps = {
    children: ReactNode;
}
type ITemplateContext = {
    templateParams: PlotTemplateParams, setTemplateParams: React.Dispatch<React.SetStateAction<PlotTemplateParams>>,
    selectorOptionChanged: boolean, setSelectorOptionChanged: React.Dispatch<React.SetStateAction<boolean>>
};

export const TemplateParamsContext = createContext<ITemplateContext>({
    templateParams: {
        $url_parameters: {
            Gene: {
                data: {
                    NCBI_GeneID: 1, // TODO: deal with default value
                },
            },
            Study: [],
        },
        $control_values: {},
        noData: false,
    },
    setTemplateParams: () => null,
    selectorOptionChanged: false,
    setSelectorOptionChanged: () => null
});

export const TemplateParamsProvider = ({ children }: TemplateParamsProps): JSX.Element => {
    const [templateParams, setTemplateParams] = useState<PlotTemplateParams>({
        $url_parameters: {
            Gene: {
                data: {
                    NCBI_GeneID: 1, // TODO: deal with default value
                },
            },
            Study: [],
        },
        $control_values: {},
        noData: false, // TODO: remove hack when empty selectedRows are fixed
    });
    const [selectorOptionChanged, setSelectorOptionChanged] = useState<boolean>(false);
    return (
        <TemplateParamsContext.Provider value={{templateParams, setTemplateParams, selectorOptionChanged, setSelectorOptionChanged}}>
            {children}
        </TemplateParamsContext.Provider>
    );
};