import { useState } from "react";
import { Nav, NavDropdown } from "react-bootstrap";
import ImageElement from "../uiElements/common/ImageElement";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUserData } from "../../redux/AuthSlice/index.slice";
import { selectThemeImagePath } from "../../redux/ThemeSlice/index.slice";
import { iconNameFormatter } from "../../utils/common";
import appNotificaton from "../../utils/notification";
import { useNavigate } from "react-router-dom";
import adminRoutesMap from "../../routesControl/adminRoutes";
import logger from "../../utils/logger";
import { adminAuth } from "../../apiEndPoints";
import config from "../../config";
import apiService from "../../services/apiService";

type AdminHeaderProps = {
  handleClickSidebar: () => void;
};

function AdminHeader({ handleClickSidebar }: AdminHeaderProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector(selectUserData);
  const siteLogo = useSelector(selectThemeImagePath);
  const [loading, setLoading] = useState(false);
  const resolvedLogo = siteLogo ? `${config.BACKEND_IMAGE_URL}${siteLogo}` : "";

  const handleLogout = async (show = true) => {
    setLoading(true);
    try {
      const res = (await apiService(adminAuth.logout)) as {
        status?: string;
        message?: string;
      };
      if (res?.status === "success") {
        if (show) {
          appNotificaton({
            type: "success",
            message: res?.message ?? "Logout successful",
          });
        }
        (dispatch as (fn: unknown) => void)(logout());
        setTimeout(() => {
          navigate(adminRoutesMap.LOGIN.path);
        }, 100);
      }
    } catch (error) {
      logger(error);
    }
    setLoading(false);
  };
  const userInitial = iconNameFormatter(
    (userData?.fullName as string | null | undefined) ?? "",
    undefined
  );
  const userDisplayName = (userData?.fullName as string | null | undefined) ?? "User";

  return (
    <header className="admin-header d-flex justify-content-between align-items-center px-3 py-2 bg-white shadow-sm sticky-top">
      <div
        className="admin-header-left d-flex align-items-center gap-2"
        onClick={() => {
          handleClickSidebar();
        }}
        style={{ cursor: "pointer" }}
      >
        <ImageElement
          className="admin-header-logo img-fluid"
          source="logo.png"
          previewSource={resolvedLogo}
          alt=""
          style={{ width: 40, height: 40 }}
        />
        <div className="admin-header-brand d-flex flex-column">
          <strong className="admin-header-title">{config.APP_NAME}</strong>
          <small className="admin-header-tagline text-muted">{config.APP_NAME} Panel</small>
        </div>
      </div>

      <div className="admin-header-right d-flex align-items-center gap-3">
        <button
          type="button"
          className="admin-header-icon-btn border-0 bg-transparent p-0 d-flex align-items-center justify-content-center"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="admin-header-bell"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <Nav defaultActiveKey="#" className="p-0 profile-dropdown navbar-nav">
          <NavDropdown
            title={
              <span className="admin-header-profile d-flex align-items-center gap-2">
                <span className="admin-header-avatar rounded-circle d-flex align-items-center justify-content-center">
                  {userInitial || "?"}
                </span>
                <span className="admin-header-name d-none d-sm-inline">{userDisplayName}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="admin-header-caret"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            }
            id="nav-dropdown"
            align="end"
          >
            <NavDropdown.Item
              href="#logout"
              as={"button"}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  void handleLogout();
                }
              }}
            >
              Logout
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </div>
    </header>
  );
}

export default AdminHeader;
