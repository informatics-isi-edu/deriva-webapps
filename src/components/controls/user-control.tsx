import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

// components
import Dropdown from '@isrd-isi-edu/deriva-webapps/src/components/controls/dropdown';
import FacetSearchPopupControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/facet-search-popup';

// models
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import Label from '../label/label';

type UserControlProps = {
    controlConfig: UserControlConfig;
    setSelectorOptionChanged: (optionChanged: boolean) => void;
    templateParams: PlotTemplateParams | VitessceTemplateParams;
    setTemplateParams: (templateParams: PlotTemplateParams | VitessceTemplateParams) => void;
};

const UserControl = ({ 
  controlConfig,
  setSelectorOptionChanged,
  templateParams,
  setTemplateParams
}: UserControlProps): JSX.Element => {
  const controlType = controlConfig.type;
  switch (controlType) {
    case 'dropdown':
      return (
        <div className="control-container">
          <Label userControlConfig={controlConfig}/>
          <Dropdown
            userControlConfig={controlConfig}
            setSelectorOptionChanged={setSelectorOptionChanged}
            templateParams={templateParams}
            setTemplateParams={setTemplateParams}
          />
        </div>
      )
    case 'facet-search-popup':
      return (
        <div className="control-container">
          <Label userControlConfig={controlConfig}/>
          <FacetSearchPopupControl
            id={controlConfig.uid}
            userControlConfig={controlConfig}
          />
        </div>
      )
    case 'markdown':
      return (
        <div className="control-container">
          <Label userControlConfig={controlConfig}/>
        </div>
      )
    default:
      return (<></>)
  }
};

export default UserControl;