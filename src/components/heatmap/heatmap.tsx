// hooks
import { useEffect, useRef, useState } from 'react';

// services
import $log from '@isrd-isi-edu/chaise/src/services/logger';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

export type HeatmapProps = {
  config: any
};

const Heatmap = ({
  config
}: HeatmapProps): JSX.Element => {

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    $log.log('config file:');
    $log.log(config);

    // TODO use `ConfigService.http.get` to fetch the requests and create the heatmap

  }, []);


  return (
    <>Heatmap component!</>
  )
}

export default Heatmap;