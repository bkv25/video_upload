import React, { useState, useEffect } from "react";
import config from "../../../../config";

type IconThemeProps = React.HTMLAttributes<HTMLSpanElement> & {
  name?: string;
  className?: string;
  color?: string;
  size?: number;
};

function IconTheme({
  name,
  className = "",
  color,
  size = 24,
  ...rest
}: IconThemeProps) {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    if (!name) return;

    const loadSvg = async () => {
      try {
        const response = await fetch(`${config.USER_IMAGE_URL}${name}`);
        if (response.ok) {
          const svgText = await response.text();
          const themedSvg = svgText
            .replace(/fill="#[^"]*"/g, 'fill="currentColor"')
            .replace(/fill='#[^']*'/g, "fill='currentColor'")
            .replace(/stroke="#[^"]*"/g, 'stroke="currentColor"')
            .replace(/stroke='#[^']*'/g, "stroke='currentColor'");
          setSvgContent(themedSvg);
        }
      } catch (error) {
        console.error(`Failed to load icon: ${name}`, error);
      }
    };

    loadSvg();
  }, [name]);

  if (!svgContent) return null;

  return (
    <span
      className={`theme-icon ${className}`}
      style={{
        width: size,
        height: size,
        color: color || "var(--theme-primary, #ff630b)",
        ...rest.style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...rest}
    />
  );
}

export default React.memo(IconTheme);

