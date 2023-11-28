// hooks
import { createContext, useEffect, useMemo, useRef, useState } from 'react';

// models
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';


export const PlotAppContext = createContext<{
  selectorOptionChanged: boolean;
  setSelectorOptionChanged: Function;
  templateParams: PlotTemplateParams;
  setTemplateParams: Function;
} | null>(null);

type PlotAppProviderProps = {
  children: React.ReactNode,
};

export default function PlotAppProvider({
  children
}: PlotAppProviderProps): JSX.Element {

  const [selectorOptionChanged, setSelectorOptionChanged] = useState<boolean>(false);
  const [templateParams, setTemplateParams] = useState<PlotTemplateParams>({
    $url_parameters: {},
    $control_values: {}
  });

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

  }, []);


  const providerValue = useMemo(() => {
    return {
      selectorOptionChanged,
      setSelectorOptionChanged,
      templateParams,
      setTemplateParams
    };
  }, [
    selectorOptionChanged, templateParams
  ]);

  return (
    <PlotAppContext.Provider value={providerValue}>
      {children}
    </PlotAppContext.Provider>
  )
}