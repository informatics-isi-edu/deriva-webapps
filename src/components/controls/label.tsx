import { createChaiseTooltips } from '@isrd-isi-edu/chaise/src/utils/ui-utils';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { convertKeysSnakeToCamel, createLink } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { useEffect, useRef } from 'react';


/**
 * MarkdownProps is the type of props for Markdown component.
 */
export type LabelProps = {
    userControlConfig: UserControlConfig;
};

/**
 * Label is a component that renders a link/text (<a> input).
 */
const Label = ({
    userControlConfig
}: LabelProps): JSX.Element => {
    const {
        templateParams
    } = usePlot();
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