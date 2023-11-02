import { createContext, useState, ReactNode } from 'react';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

type TemplateParamsProps = {
  children: ReactNode;
}

type ITemplateContext = {templateParams: PlotTemplateParams, setTemplateParams: React.Dispatch<React.SetStateAction<PlotTemplateParams>>,
  selectorOptionChanged: boolean, setSelectorOptionChanged: React.Dispatch<React.SetStateAction<boolean>> };

// Define the context with the correct initial value

export const TemplateParamsContext = createContext<ITemplateContext>({templateParams: { 
  $url_parameters: {
  Gene: {
    data: {
      NCBI_GeneID: 1, // TODO: deal with default value
    },
  },
  Study: [],
},
$control_values: {},
noData: false,}, setTemplateParams: () => null, selectorOptionChanged: false, setSelectorOptionChanged: ()=>null});


// eslint-disable-next-line @typescript-eslint/no-empty-function
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