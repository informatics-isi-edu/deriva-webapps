import { ReactNode } from 'react';

export type SelectViewProps = {
  label?: string;
  children: ReactNode;
};

const SelectView = ({ label, children }: SelectViewProps): JSX.Element => (
  <div className='selector-container'>
    {label ? <label className='selector-label'>{label}: </label> : null}
    {children}
  </div>
);

export default SelectView;
