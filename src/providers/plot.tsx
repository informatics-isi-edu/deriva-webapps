// hooks
import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { useUserControls } from '@isrd-isi-edu/deriva-webapps/src/hooks/control';


export const PlotContext = createContext<{
  templateParams: PlotTemplateParams;
  setTemplateParams: Function;
} | null>(null);

type PlotProviderProps = {
  children: React.ReactNode,
};

export default function PlotProvider({
  children
}: PlotProviderProps): JSX.Element {

  const [templateParams, setTemplateParams] = useState<PlotTemplateParams>({
    $url_parameters: {},
    $control_values: {},
    noData: false, // TODO: remove hack when empty selectedRows are fixed
  })

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

  }, []);


  const providerValue = useMemo(() => {
    return {
      templateParams,
      setTemplateParams
    };
  }, [
    templateParams
  ]);

  return (
    <PlotContext.Provider value={providerValue}>
      {children}
    </PlotContext.Provider>
  )
}