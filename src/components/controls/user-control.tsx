import '@isrd-isi-edu/chaise/src/assets/app.scss';
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
        <Dropdown
          userControlConfig={controlConfig}
          setSelectorOptionChanged={setSelectorOptionChanged}
          templateParams={templateParams}
          setTemplateParams={setTemplateParams}
        />
      )
    case 'facet-search-popup':
      return (
        <FacetSearchPopupControl
          id={controlConfig.uid}
          userControlConfig={controlConfig}
        />
      )
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
  const styleClasses = controlConfig.classes?.join(' ');

  return (
    //Append all styles classes to the control
    <div className={`control-container ${styleClasses}`}>
      <Label userControlConfig={controlConfig} />
      {getControl({
        controlConfig, setSelectorOptionChanged,
        templateParams,
        setTemplateParams
      })}
    </div>
  );
};

export default UserControl;