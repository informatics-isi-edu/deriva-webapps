import { useContext } from 'react';
import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { TemplateParamsContext } from '@isrd-isi-edu/deriva-webapps/src/components/plot/template-params';


type UserControlsGridProps = {
    /**
     * selectors data to be rendered
     */
    controlConfig: UserControlConfig;
    controlOptions: Option[];
};


/**
 * It sets a new value in templateParams.$control_values based on selector, 
 * triggers the setSelectorOptionChanged function, and returns the option
 * @param option changed option
 * @param userControlConfig configuration of the given selector
 * @param templateParams 
 * @param setSelectorOptionChanged setState method to indicate the change
 * @returns 
 */
const handleChange = (option: Option, userControlConfig: UserControlConfig, setTemplateParams: any, setSelectorOptionChanged: any) => {
    if (option) {
        setSelectorOptionChanged(true);
        const uid = userControlConfig?.uid;
        const valueKey = userControlConfig?.request_info?.value_key;
        setTemplateParams((prevTemplateParams: any)=>{
            return{
                ...prevTemplateParams,
                $control_values: {
                    ...prevTemplateParams.$control_values,
                    [uid]:{
                        values: {
                            [valueKey]: option.value,
                        }
                    }
                }
            }
        })
        return option;
    }
};


const UserControl = ({ controlConfig, controlOptions }: UserControlsGridProps): JSX.Element => {
    const {templateParams, setTemplateParams, setSelectorOptionChanged} = useContext(TemplateParamsContext);
    const uid: string=controlConfig.uid;
    const valueKey: string=controlConfig.request_info.value_key;
    const selectedOption = controlOptions.find((option: Option) =>
            option.value === templateParams?.$control_values[uid]?.values[valueKey]);
    return (
                <DropdownSelect
                    id={controlConfig.uid}
                    defaultOptions={controlOptions}
                    label={controlConfig?.label}
                    //Using any for option type instead of 'Option' to avoid the lint error
                    onChange={(option: any) => {
                        handleChange(option, controlConfig, setTemplateParams, setSelectorOptionChanged);
                    }}
                    value={selectedOption}
                />
    );

};

export default UserControl;
