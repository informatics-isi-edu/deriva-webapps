import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_treeview.scss';

// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// models
import { TreeviewConfigProps } from '@isrd-isi-edu/deriva-webapps/src/models/treeview';

// utils
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';

const ChaiseTreeview = (): JSX.Element => {
  const { dispatchError, errors } = useError();
  const [dataConfig, setDataConfig] = useState<TreeviewConfigProps | null>(null);

  useEffect(() => {
    try {
      setDataConfig(getConfigObject<TreeviewConfigProps>(windowRef.treeviewConfigs));
    } catch (error) {
      dispatchError({ error });
    }
  }, []);

  if (!dataConfig && errors.length > 0) {
    return <></>;
  }

  if (!dataConfig) {
    return <ChaiseSpinner />;
  }

  return (
    <div className='treeview-page'>
      Treeview app!
      {/* TODO */}
    </div>
  )
}

export default ChaiseTreeview;
