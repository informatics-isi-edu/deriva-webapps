import { createChaiseTooltips } from '@isrd-isi-edu/chaise/src/utils/ui-utils';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { createLink, toCSSStyle } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { useEffect, useRef } from 'react';


/**
 * MarkdownProps is the type of props for Markdown component.
 */
export type MarkdownProps = {
    userControlConfig: UserControlConfig;
};

/**
 * Markdown is a component that renders a link (<a> input).
 */
const Markdown = ({
    userControlConfig
}: MarkdownProps): JSX.Element => {
    const {
        templateParams
    } = usePlot();
    const link = createLink(userControlConfig.label.markdown_pattern, templateParams);
    const labelStyles = toCSSStyle(userControlConfig.label.styles);
      // handle tooltips that might be in the value
  const spanRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!spanRef.current) return;
    createChaiseTooltips(spanRef.current);
  }, []);

    return link ? <>
    <div ref={spanRef} className="markdown" style={labelStyles} dangerouslySetInnerHTML={{ __html: link }} />
    {/* <p className="clamped clamped-2">
        <span className="text">
            {link}
            <span className="ellipsis">
                &#133;
            </span>
            <span className="fill"></span>
        </span>
    </p> */}
    </> : <></>;
}

export default Markdown;