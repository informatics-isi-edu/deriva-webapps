import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';

// components
import Dropdown from '@isrd-isi-edu/deriva-webapps/src/components/controls/dropdown';
import FacetSearchPopupControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/facet-search-popup';

// models
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import Markdown from './markdown';

type UserControlProps = {
    controlConfig: UserControlConfig;
};

const UserControl = ({ controlConfig }: UserControlProps): JSX.Element => {
  const controlType = controlConfig.type;
  switch (controlType) {
    case 'dropdown':
      return (
        <div>
          <Dropdown
            userControlConfig={controlConfig}
          />
        </div>
      )
    case 'facet-search-popup':
      return (
        <div>
          <FacetSearchPopupControl
            id={controlConfig.uid}
            label={controlConfig?.label?.text}
            userControlConfig={controlConfig}
          />
        </div>
      )
    case 'markdown':
      return (
        <div>
          <Markdown
            userControlConfig={controlConfig}
          />
        </div>
      )
    default:
      return (<></>)
  }
};

export default UserControl;