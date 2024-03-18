import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_vitessce.scss';

// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState } from 'react';

// models
import { DerivaVitessceDataConfig, VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

// utilities
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { Vitessce } from 'vitessce';


export type DerivaVitessceProps = {
  config: DerivaVitessceDataConfig;
  templateParams: VitessceTemplateParams;
};

const DerivaVitessce = ({
  config,
  templateParams,
}: DerivaVitessceProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [componentConfig, setComponentConfig] = useState<any>(null);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    // check for `url_pattern` defined for each file to use as the `url`
    // if both are defined, `url_pattern` will replace `url`
    const tempConfig = {...config.vitessce};
    tempConfig.datasets.forEach((dataset) => {
      dataset.files.forEach((file: any) => {
        if (file.url_pattern) {
          const { uri } = getPatternUri(file.url_pattern, templateParams);
          file.url = uri
        }
      })
    })

    setComponentConfig(tempConfig);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (<ChaiseSpinner />);
  }

  if (!componentConfig) {
    return (<h3>No vitessce-config.js Found</h3>);
  }


  return (<>
    <Vitessce
      config={componentConfig}
      height={config.height || 800}
      // 'dark' has black backgrounds for each component
      // 'light' has grey backgrounds
      // no value has white backgrounds
      theme={config.theme || 'light'}
    />
  </>
  );
}

export default DerivaVitessce;