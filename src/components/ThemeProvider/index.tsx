import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../redux/ThemeSlice/index.slice";
import type { ThemeData } from "../../redux/ThemeSlice/index.slice";
import config from "../../config";

const toKebabCase = (str: string): string => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useSelector(selectTheme) as ThemeData | undefined;

  useEffect(() => {
    const root = document.documentElement;

    if (theme?.theme_color) {
      Object.entries(theme.theme_color).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${toKebabCase(key)}`, String(value));
      });
    }

    root.style.setProperty("--theme-site-logo", theme?.site_logo || "");

    if (theme?.site_logo) {
      const favicon =
        theme.site_logo.startsWith("http://") ||
        theme.site_logo.startsWith("https://")
          ? theme.site_logo
          : `${config.BACKEND_IMAGE_URL}${theme.site_logo}`;

      const link: HTMLLinkElement =
        (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null) ||
        document.createElement("link");
      link.rel = "icon";
      link.href = favicon;
      document.head.appendChild(link);
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
