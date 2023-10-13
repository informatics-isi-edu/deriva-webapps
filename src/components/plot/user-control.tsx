import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';


type UserControlsGridProps = {
    /**
     * selectors data to be rendered
     */
    userControlData: {
        controlConfig: UserControlConfig;
        templateParams: PlotTemplateParams,
    };
    controlOptions: Option[];
    setSelectorOptionChanged: any;
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
const handleChange = (option: Option, userControlConfig: UserControlConfig, templateParams: PlotTemplateParams, setSelectorOptionChanged: any) => {
    if (option) {
        setSelectorOptionChanged(true);
        const uid = userControlConfig?.uid;
        const valueKey = userControlConfig?.request_info?.value_key;
        templateParams.$control_values[uid].values = {
            [valueKey]: option.value, //else use default value
        };
        return option;
    }
};


const UserControl = ({ userControlData, controlOptions, setSelectorOptionChanged }: UserControlsGridProps): JSX.Element => {
    const uid: string=userControlData.controlConfig.uid;
    const valueKey: string=userControlData.controlConfig.request_info.value_key;
    const selectedOption = controlOptions.find((option: Option) =>
            option.value === userControlData.templateParams?.$control_values[uid].values[valueKey]);
console.log(userControlData.controlConfig.uid);
    return (
            <div key={userControlData.controlConfig.uid}>
                <DropdownSelect
                    id={userControlData.controlConfig.uid}
                    defaultOptions={controlOptions}
                    label={userControlData.controlConfig?.label}
                    //Using any for option type instead of 'Option' to avoid the lint error
                    onChange={(option: any) => {
                        handleChange(option, userControlData?.controlConfig, userControlData.templateParams, setSelectorOptionChanged);
                    }}
                    value={selectedOption}
                />
            </div>
    );

};

export default UserControl;
