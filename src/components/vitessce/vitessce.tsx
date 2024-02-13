import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_vitessce.scss';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// services
import { DerivaVitessceConfig } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce-config';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// utilities
import { AnnDataWrapper, Vitessce, VitessceConfig, ViewType } from 'vitessce';


export type DerivaVitessceProps = {
  config: DerivaVitessceConfig
};

const DerivaVitessce = ({
  config,
}: DerivaVitessceProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [componentConfig, setComponentConfig] = useState<any>(null);
  const { dispatchError } = useError();

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    // translates JSON to config language but then changes some of the objects to be inconsistent with component config prop (<Vitessce "config" />)
    // const vc = VitessceConfig.fromJSON(config);
    // console.log(vc);

    setComponentConfig(config);
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
      height={800}
      theme='dark'
    />
  </>
  );
}

export default DerivaVitessce;