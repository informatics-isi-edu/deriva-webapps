import Async, { AsyncProps } from 'react-select/async';
import { MenuListProps, StylesConfig } from 'react-select';
import { FixedSizeList } from 'react-window';
import { SelectComponents } from 'react-select/dist/declarations/src/components';

export type Option = {
  /**
   * value of option
   */
  value: string;
  /**
   * displayed label of option
   */
  label: string;
};

type VirtualizedSelectProps = AsyncProps<any, any, any> & {
  itemHeight: number; // the height of each menu item
  hideDropdownIndicator?: boolean; // hide the dropdown indicator (down chevron)
  useOptimizedOption?: boolean; // use optimized option for each menu item (but disables mouseover effects)
};

// Define Custom Styles for the Select Component
export const SelectStyles: StylesConfig = {
  option: (base) => ({ ...base, ...{ height: 30, padding: '4px 12px' } }),
  control: (base) => ({ ...base, ...{ height: 30, minHeight: 30, padding: '0px 10px' } }),
  singleValue: (base) => ({ ...base, padding: 0 }),
  valueContainer: (base) => ({ ...base, padding: 0 }),
  indicatorsContainer: (base) => ({ ...base, padding: 0 }),
  dropdownIndicator: (base) => ({ ...base, paddingTop: 0, paddingBottom: 0 }),
  clearIndicator: (base) => ({ ...base, padding: 0 }),
  menu: (base) => ({ ...base, marginTop: 0 }),
};

/**
 * Faster and more efficient version of react-select made by combining virtualization from react-window into the menu lists
 * in react-select
 */
const VirtualizedSelect = ({
  hideDropdownIndicator,
  options = [],
  itemHeight,
  components,
  styles,
  useOptimizedOption,
  ...restProps
}: VirtualizedSelectProps): JSX.Element => {
  // Using a virtualized menulist instead for faster performance
  const MenuList = ({ children, maxHeight, getValue }: MenuListProps): JSX.Element => {
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * itemHeight;

    if (!Array.isArray(children) || children.length === 0) return <></>;

    const height = Math.min(itemHeight * children.length, maxHeight);
    return (
      <FixedSizeList
        height={height}
        width='100%'
        itemCount={children.length}
        itemSize={itemHeight}
        initialScrollOffset={initialOffset}
      >
        {({ index, style }) => (
          <div style={{ ...style, display: 'flex', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {children[index]}
          </div>
        )}
      </FixedSizeList>
    );
  };

  // Removes the constant mousmove and mouseover props that are causing performance delays from rerenders
  const Option = ({ children, ...props }: any) => {
    const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
    const newProps: any = Object.assign(props, { innerProps: rest });
    return (
      <div
        ref={newProps.innerRef}
        selected={newProps.isFocused}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0px 10px',
          height: itemHeight,
          fontWeight: newProps.isSelected ? 600 : 400,
        }}
        {...newProps.innerProps}
      >
        {children}
      </div>
    );
  };

  /**
   * Function to filter based on searched options
   */
  const loadOptions = (input: string, callback: any) => {
    setTimeout(() => {
      callback(
        options.filter(({ label }: any) => label.toLowerCase().includes(input.toLowerCase()))
      );
    }, 200);
  };

  const newComponents: Partial<SelectComponents<unknown, any, any>> = {
    MenuList: memo(MenuList),
    ...components,
  };

  if (hideDropdownIndicator) {
    newComponents['DropdownIndicator'] = () => null;
    newComponents['IndicatorSeparator'] = () => null;
  }
  if (useOptimizedOption) {
    newComponents['Option'] = memo(Option);
  }

  return (
    <Async
      className='async-select'
      styles={{ ...SelectStyles, ...styles }}
      components={newComponents}
      options={options}
      loadOptions={loadOptions}
      {...restProps}
    />
  );
};

export default VirtualizedSelect;
