import { createContext, useState, ReactNode } from 'react';

type TemplateParamsProps = {
  children: ReactNode;
}

// Define the context with the correct initial value
export const TemplateParamsContext = createContext({});

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const TemplateParamsProvider = ({ children }: TemplateParamsProps): JSX.Element => {
  const [templateParams, setTemplateParams] = useState({
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
  return (
    <TemplateParamsContext.Provider value={{templateParams, setTemplateParams }}>
      {children}
    </TemplateParamsContext.Provider>
  );
};