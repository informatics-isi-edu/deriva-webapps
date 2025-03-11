// components
import DisplayValue from '@isrd-isi-edu/chaise/src/components/display-value';

// models
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

// utils
import { convertKeysSnakeToCamel, createLink } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

import type { JSX } from 'react';

/**
 * MarkdownProps is the type of props for Markdown component.
 */
export type LabelProps = {
  userControlConfig: UserControlConfig;
  templateParams: PlotTemplateParams | VitessceTemplateParams
};

/**
 * Label is a component that renders a link/text (<a> input).
 */
const Label = ({
  userControlConfig,
  templateParams
}: LabelProps): JSX.Element => {
  return (
    <DisplayValue
      as='label'
      value={{ isHTML: true, value: createLink(userControlConfig.label.markdown_pattern, templateParams) }}
      addClass
      className='control-label'
      styles={convertKeysSnakeToCamel(userControlConfig.label.styles)}
    />
  );
}

export default Label;