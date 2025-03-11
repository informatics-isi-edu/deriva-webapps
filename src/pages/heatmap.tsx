import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import Heatmap, { HeatmapProps } from '@isrd-isi-edu/deriva-webapps/src/components/heatmap/heatmap';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState, type JSX } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';


const heatmapSettings = {
  appName: 'app/heatmap',
  appTitle: 'Heatmap',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const HeatmapApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();

  const [heatmapProps, setHeatmapProps] = useState<HeatmapProps | null>(null);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      setHeatmapProps({ config: windowRef.heatmapConfig });

    } catch (error: any) {
      dispatchError({ error })
    }

  }, []);

  // if there was an error during setup, hide the spinner
  if (!heatmapProps && errors.length > 0) {
    return <></>;
  }

  if (!heatmapProps) {
    return <ChaiseSpinner />;
  }

  return <Heatmap {...heatmapProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={heatmapSettings} includeNavbar displaySpinner ignoreHashChange>
    <HeatmapApp />
  </AppWrapper>
);