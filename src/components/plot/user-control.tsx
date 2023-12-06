import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { ControlScope, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import useTemplateParams from '@isrd-isi-edu/deriva-webapps/src/hooks/template-params';


type UserControlsGridProps = {
    /**
     * selectors data to be rendered
     */
    controlConfig: UserControlConfig;
    controlOptions: Option[];
    // controlIndex: number;
    // controlScope: ControlScope;
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
    console.log(userControlConfig);
    if (option) {
        setSelectorOptionChanged(true);
        const uid = userControlConfig?.uid || '';
        const valueKey = userControlConfig?.request_info?.value_key;
        setTemplateParams((prevTemplateParams: any) => {
            return {
                ...prevTemplateParams,
                $control_values: {
                    ...prevTemplateParams.$control_values,
                    [uid]: {
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
    const { templateParams, setTemplateParams, setSelectorOptionChanged } = useTemplateParams();
    const controlType = controlConfig.type;
    switch (controlType) {
        case 'dropdown':
            const uid = controlConfig?.uid;
            const valueKey: string = controlConfig.request_info.value_key;
            const selectedOption = controlOptions.find((option: Option) =>
                uid && option.value === templateParams?.$control_values[uid]?.values[valueKey]);
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

        default:
            return <></>;
    }

};

export default UserControl;
