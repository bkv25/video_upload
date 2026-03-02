import React, { useEffect, useMemo, useState } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import { moduleRoutes } from "../../routes";
import { getMenu } from "../../utils/common";
import { Link, useLocation, useNavigate, type To } from "react-router-dom";
import adminRoutesMap from "../../routesControl/adminRoutes";
import { selectThemeImagePath } from "../../redux/ThemeSlice/index.slice";
import config from "../../config";
import { IconTheme, ImageElement } from "../uiElements";

type SidebarMenuItem = {
  name?: string;
  path?: string;
  icon?: string;
  children?: SidebarMenuItem[];
};

type AdminSidebarProps = {
  children?: React.ReactNode;
};

type GetDropDownMenuProps = {
  list: SidebarMenuItem;
  isChild: boolean;
  activePath: (path?: string) => boolean;
  pathname: string;
};

const GetDropDownMenu = ({ list, isChild, activePath, pathname }: GetDropDownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if ((list?.children?.length ?? 0) > 0) {
      function checkActive(arr: SidebarMenuItem): boolean {
        return !!arr?.children?.some((e) => {
          if ((e?.children?.length ?? 0) > 0) return checkActive(e);
          return activePath(e?.path);
        });
      }
      setIsOpen(checkActive(list));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, pathname]);

  return (
    <NavDropdown
      title={
        <div className="sidebar-dropdown-title d-flex justify-content-between align-items-center gap-2 w-100">
          <span className="d-flex gap-2 align-items-center">
            <IconTheme name={list?.icon} className="sidemenu-icon" />
            {list?.name}
          </span>
          <IconTheme
            name="arrowOrange.svg"
            className={`arrow-sidemenu ${isOpen ? "arrow-up" : "arrow-down"}`}
            aria-hidden
          />
        </div>
      }
      id={`basic-nav-dropdown-${list?.name}`}
      className={isChild ? "nav-link child-nav" : "sidebar-nav-dropdown"}
      autoClose={false}
      show={isOpen}
      onToggle={(open: boolean) => setIsOpen(open)}
    >
      {list?.children?.map((childItem, childKey) => {
        if ((childItem?.children?.length ?? 0) > 0) {
          return (
            <GetDropDownMenu
              list={childItem}
              isChild={true}
              activePath={activePath}
              pathname={pathname}
              key={childKey}
            />
          );
        }
        return (
          <Link
            key={childKey}
            className={`dropdown-item ${activePath(childItem?.path) ? "active" : ""}`}
            to={childItem?.path as unknown as To}
          >
            {childItem?.name}
          </Link>
        );
      })}
    </NavDropdown>
  );
};

function AdminSidebar({ children }: AdminSidebarProps) {
  const routeList = moduleRoutes();
  const location = useLocation();
  const navigate = useNavigate();
  const siteLogo = useSelector(selectThemeImagePath) as string | undefined | null;
  const resolvedLogo = siteLogo ? `${config.BACKEND_IMAGE_URL}${siteLogo}` : "";

  const routes = useMemo(() => {
    return (getMenu(routeList?.admin, "belongsToSidebar") || []) as SidebarMenuItem[];
  }, [routeList]);

  const activePath = (data?: string) => {
    let path = location?.pathname;
    path = location?.pathname.includes(adminRoutesMap.CHILD_ONE.path) ? adminRoutesMap.CHILD_ONE.path : path;
    path = location?.pathname.includes(adminRoutesMap.CHILD_TWO.path) ? adminRoutesMap.CHILD_TWO.path : path;
    return path === data;
  };

  return (
    <>
      <div className="sidebar d-flex flex-column bg-white border-end vh-100 p-0">
        <div
          className="mb-4 d-flex align-items-center gap-2 sidebar-header flex-shrink-1 p-3"
          style={{ cursor: "pointer" }}
          onClick={() => {
            navigate(adminRoutesMap.DASHBOARD.path);
          }}
        >
          <ImageElement
            source="logo.png"
            previewSource={resolvedLogo}
            alt="logo"
            className="admin-logo img-fluid"
            style={{ width: 50, height: 50 }}
          />
          <div className="logo-text">
            <strong className="w-100 d-inline-block">{config.APP_NAME}</strong>
            <small className="small-text text-muted">{config.APP_NAME} Panel</small>
          </div>
        </div>

        <Nav
          defaultActiveKey="#"
          className="pt-2 nav flex-column overflow-x-hidden overflow-y-auto px-3"
        >
          {routes?.map((item, key) => {
            return (
              <React.Fragment key={key}>
                {(item?.children?.length ?? 0) > 0 ? (
                  <GetDropDownMenu
                    list={item}
                    isChild={false}
                    activePath={activePath}
                    pathname={location.pathname}
                  />
                ) : (
                  <>
                    <Link
                      to={item?.path as unknown as To}
                      className={`nav-link d-flex align-items-center gap-2 ${
                        activePath(item?.path) ? "active" : ""
                      }`}
                    >
                      <IconTheme name={item?.icon} className="sidemenu-icon" />
                      {item?.name}
                    </Link>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Nav>
        {children}
      </div>
    </>
  );
}

export default AdminSidebar;
