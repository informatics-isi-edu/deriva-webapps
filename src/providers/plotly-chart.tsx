// hooks
import { createContext, useEffect, useMemo, useRef, useState, type JSX } from 'react';

export const PlotlyChartContext = createContext<{
  noData: boolean | null;
  setNoData: Function;
} | null>(null);

type PlotlyChartProviderProps = {
  children: React.ReactNode,
};

export default function PlotlyChartProvider({
  children
}: PlotlyChartProviderProps): JSX.Element {

  const [noData, setNoData] = useState<boolean | null>(null);

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
      setNoData
    };
  }, [noData]);

  return (
    <PlotlyChartContext.Provider value={providerValue}>
      {children}
    </PlotlyChartContext.Provider>
  )
}