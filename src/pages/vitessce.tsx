import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import DerivaVitessce, { DerivaVitessceProps} from '@isrd-isi-edu/deriva-webapps/src/components/vitessce/vitessce'
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useState } from 'react';
import { useVitessceConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/vitessce';

// models
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getQueryParams } from '@isrd-isi-edu/chaise/src/utils/uri-utils';


const derivaVitessceSettings = {
  appName: 'app/vitessce',
  appTitle: 'Vitessce',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const DerivaVitessceApp = (): JSX.Element => {

  const { config, errors } = useVitessceConfig(windowRef.vitessceConfigs);

  const [vitessceProps, setVitessceProps] = useState<DerivaVitessceProps | null>(null);
  const [templateParams, setTemplateParams] = useState<VitessceTemplateParams>({
    $url_parameters: {}
  });

  useEffect(() => {
    const allQueryParams = getQueryParams(windowRef.location.href);

    const tempParams = {...templateParams};
    // push query parameters into templating environment
    Object.keys(allQueryParams).forEach((key: string) => {
      tempParams.$url_parameters[key] = allQueryParams[key];
    });

    setTemplateParams(tempParams);

    if (config) {
      setVitessceProps({ config: config, templateParams: tempParams });
    }
  }, [config]);

  // if there was an error during setup, hide the spinner
  if (!vitessceProps && errors.length > 0) {
    return <></>;
  }

  if (!vitessceProps) {
    return <ChaiseSpinner />;
  }

  return <DerivaVitessce {...vitessceProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={derivaVitessceSettings} includeNavbar displaySpinner ignoreHashChange>
    <DerivaVitessceApp />
  </AppWrapper>
);