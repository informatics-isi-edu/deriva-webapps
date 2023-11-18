// hooks
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';


export const PlotContext = createContext<{
  noData: boolean | null;
  setNoData: Function;
  selectorOptionChanged: boolean;
  setSelectorOptionChanged: Function;
  templateParams: PlotTemplateParams;
  setTemplateParams: Function;
} | null>(null);

type PlotProviderProps = {
  children: React.ReactNode,
};

export default function PlotProvider({
  children
}: PlotProviderProps): JSX.Element {

  const [noData, setNoData] = useState<boolean | null>(null);
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
      noData,
      setNoData,
      selectorOptionChanged,
      setSelectorOptionChanged,
      templateParams,
      setTemplateParams
    };
  }, [
    noData, selectorOptionChanged, templateParams
  ]);

  return (
    <PlotContext.Provider value={providerValue}>
      {children}
    </PlotContext.Provider>
  )
}