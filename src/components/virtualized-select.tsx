import { memo, useState } from 'react';
import Async, { AsyncProps } from 'react-select/async';
import { MenuListProps, StylesConfig } from 'react-select';
import { FixedSizeList } from 'react-window';
import { SelectComponents } from 'react-select/dist/declarations/src/components';

type VirtualizedSelectProps = AsyncProps<any, any, any> & {
  itemHeight: number;
  hideDropdownIndicator?: boolean;
};

const SelectStyles: StylesConfig = {
  input: (base) => ({ ...base, ...{ height: 30, minHeight: 30 } }),
  menu: (base) => ({ ...base, ...{ marginTop: 0 } }),
};

const VirtualizedSelect = (props: VirtualizedSelectProps): JSX.Element => {
  const {
    hideDropdownIndicator,
    options = [],
    itemHeight,
    components,
    styles,
    ...restProps
  } = props;

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
        {({ index, style }) => <div style={style}>{children[index]}</div>}
      </FixedSizeList>
    );
  };

  // TODO: use for extra optimization when needed
  const Option = ({ children, ...props }: any) => {
    const { onMouseMove, onMouseOver, ...rest } = props.innerProps;
    const newProps: any = Object.assign(props, { innerProps: rest });
    return (
      <div
        ref={newProps.innerRef}
        selected={newProps.isFocused}
        style={{
          fontWeight: newProps.isSelected ? 600 : 400,
        }}
        {...newProps.innerProps}
      >
        {children}
      </div>
    );
  };

  const loadOptions = (input: string, callback: any) => {
    setTimeout(() => {
      callback(
        options.filter(({ label }: any) => label.toLowerCase().includes(input.toLowerCase()))
      );
    }, 200);
  };

  const newComponents: Partial<SelectComponents<unknown, any, any>> = {
    MenuList: memo(MenuList),
    //  Option: memo(Option)
    ...components,
  };

  if (hideDropdownIndicator) {
    newComponents['DropdownIndicator'] = () => null;
    newComponents['IndicatorSeparator'] = () => null;
  }

  return (
    <Async
      styles={{ ...SelectStyles, ...styles }}
      components={newComponents}
      options={options}
      loadOptions={loadOptions}
      {...restProps}
    />
  );
};

export default memo(VirtualizedSelect);