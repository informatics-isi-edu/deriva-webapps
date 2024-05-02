// hooks
import { useEffect, useRef } from 'react';

// models
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';

// utils
import { createChaiseTooltips } from '@isrd-isi-edu/chaise/src/utils/ui-utils';
import { convertKeysSnakeToCamel, createLink } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

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
    
    const link = createLink(userControlConfig.label.markdown_pattern, templateParams);
    const labelStyles = convertKeysSnakeToCamel(userControlConfig.label.styles); 
    // handle tooltips that might be in the value
    const spanRef = useRef<HTMLLabelElement | null>(null);
    useEffect(() => {
        if (!spanRef.current) return;
        createChaiseTooltips(spanRef.current);
    }, []);

    return link ?
        <label ref={spanRef} className="control-label" style={labelStyles} dangerouslySetInnerHTML={{ __html: link }} />
        : <></>;
}

export default Label;