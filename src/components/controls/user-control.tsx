// CSS Styles
import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

// components
import Dropdown from '@isrd-isi-edu/deriva-webapps/src/components/controls/dropdown';
import FacetSearchPopupControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/facet-search-popup';

// models
import Label from '@isrd-isi-edu/deriva-webapps/src/components/controls/label';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';

import type { JSX } from 'react';

type UserControlProps = {
  controlConfig: UserControlConfig;
  setSelectorOptionChanged: (optionChanged: boolean) => void;
  templateParams: PlotTemplateParams | VitessceTemplateParams;
  setTemplateParams: (templateParams: PlotTemplateParams | VitessceTemplateParams) => void;
};

const getControl = ({
  controlConfig,
  setSelectorOptionChanged,
  templateParams,
  setTemplateParams
}: UserControlProps) => {
  const controlType = controlConfig.type;
  switch (controlType) {
    case 'dropdown':
      return (
        <>
        <Label 
          userControlConfig={controlConfig}
          templateParams={templateParams}
        />
        <Dropdown
          userControlConfig={controlConfig}
          setSelectorOptionChanged={setSelectorOptionChanged}
          templateParams={templateParams}
          setTemplateParams={setTemplateParams}
          noLabel={true}
        />
        </>
      )
    case 'facet-search-popup':
      return (
        <>
        <Label 
          userControlConfig={controlConfig}
          templateParams={templateParams}
        />
        <FacetSearchPopupControl
          id={controlConfig.uid}
          userControlConfig={controlConfig}
        />
        </>
      )
    case 'markdown':
      return <Label 
        userControlConfig={controlConfig}
        templateParams={templateParams}
      />
    default:
      return (<></>)
  }
}

const UserControl = ({
  controlConfig,
  setSelectorOptionChanged,
  templateParams,
  setTemplateParams
}: UserControlProps): JSX.Element => {
  const styleClasses = controlConfig.classes ? controlConfig.classes.join(' ') : '';

  return (
    // Append all chaise styles classes to the control
    <div className={`control-container ${styleClasses}`}>
      {getControl({
        controlConfig, setSelectorOptionChanged,
        templateParams,
        setTemplateParams
      })}
    </div>
  );
};

export default UserControl;