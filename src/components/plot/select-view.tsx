import { ReactNode } from 'react';

export type SelectViewProps = {
  /**
   * id for the select input
   */
  id?: string;
  /**
   * label for the select input
   */
  label?: string;
  /**
   * children of the view
   */
  children: ReactNode;
};

/**
 * SelectView is a view component for the outer element of an input.
 */
const SelectView = ({ label, id, children }: SelectViewProps): JSX.Element => (
  <div id={id} className='selector-container'>
    {label ? <label className='selector-label'>{label}: </label> : null}
    {children}
  </div>
);

export default SelectView;
