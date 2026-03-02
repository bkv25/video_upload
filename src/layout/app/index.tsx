import { useCallback, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
// import { useSelector } from "react-redux";
// import { selectUserData } from "../../redux/AuthSlice/index.slice";
import { generatePath, useLocation, useParams } from "react-router-dom";
import { getCompleteRouteList } from "../../routes";
import { getLocalStorageToken } from "../../utils/common";
// import appNotificaton from "../../utils/notification";
// import appNotificaton from "../../utils/notification";

type AppRoute = {
  path: string;
  name?: string;
  private?: boolean;
  common?: boolean;
};

type AppLayoutProps = {
  children: ReactNode;
  setRedirectPath: (path: string) => void;
  // Kept generic as implementation is not shown here
  rolePermissionRoute?: unknown;
};

function AppLayout({
  children,
  setRedirectPath,
}: AppLayoutProps) {
  const routes = getCompleteRouteList() as AppRoute[];
  const location = useLocation();
  const params = useParams();
  // const userData = useSelector(selectUserData);
  const userToken = getLocalStorageToken();

  const activeRoute = useMemo<AppRoute | undefined>(() => {
    if (routes?.length > 0) {
      return routes?.find((routeConfig) => {
        let route: string;
        try {
          route = generatePath(routeConfig.path, params);
        } catch {
          route = routeConfig.path;
        }
        const browserPath = location.pathname;

        return route === browserPath;
      });
    }
  }, [location.pathname, params, routes]);

  const isPrivate = useMemo<boolean | undefined>(() => {
    return activeRoute?.private;
  }, [activeRoute]);

  // const userType = useMemo(() => {
  //   let userType;
  //   let path = location.pathname.replace("/", "").split("/");
  //   if (path?.[0] === "admin") {
  //     userType = "admin";
  //   } else if (path?.[0] === "vendor") {
  //     userType = "vendor";
  //   } else {
  //     userType = "user";
  //   }
  //   // return userData?.userType === "admin" || location.pathname.includes("admin") ? "admin" : "user"
  //   return userType;
  // }, [location, userData]);

  const isValid = useMemo<boolean>(() => {
    if (activeRoute?.name) {
      if (activeRoute?.common) {
        return true;
      } else if (activeRoute.private) {
        if (userToken) {
          return true;
        } else {
          return false;
        }
      } else {
        if (userToken) {
          return false;
        }

        if (activeRoute.private === false) {
          return true;
        } else {
          return false;
        }
      }
    }

    return true;
  }, [activeRoute, userToken]);

  const checkValid = useCallback((): void => {
    if (!isValid) {
      const privatePath = "/dashboard";
      const publicPath = "/";

      if (isPrivate) {
        setRedirectPath(publicPath);
      } else if (isPrivate === false) {
        setRedirectPath(privatePath);
      } else {
        // setRedirectPath(location.pathname);
      }
    }
  }, [isValid, isPrivate, setRedirectPath]);

  useEffect(() => {
    checkValid();
  }, [checkValid]);

  return <>{isValid && children}</>;
}

export default AppLayout;
