// import "antd/dist/reset.css";
import { Outlet } from "react-router-dom";
import "./../../scss/global.scss";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateColors, updateImagePath } from "../../redux/ThemeSlice/index.slice";
import logger from "../../utils/logger";
import { adminAuth } from "../../apiEndPoints";
import apiService from "../../services/apiService";
// import "./../../scss/globalWider.scss";

type ThemeDetailsResponse = {
  status?: string;
  data?: {
    theme_color?: Record<string, unknown>;
    site_logo?: string;
  };
};

function AdminLayout() {
  const dispatch = useDispatch();

  const fetchTheme = useCallback(async (): Promise<void> => {
    try {
      const res = (await apiService(adminAuth.getDetailsData, {
        hideErrorNotification: true,
      })) as ThemeDetailsResponse;

      if (res?.status === "success" && res.data) {
        if (res.data.theme_color) {
          dispatch(updateColors(res.data.theme_color));
        }
        dispatch(updateImagePath(res.data.site_logo || ""));
      } else {
        dispatch(updateImagePath(""));
      }
    } catch (error) {
      logger(error);
      dispatch(updateImagePath(""));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTheme();
  }, [fetchTheme]);

  return (
    <>
      <Outlet />
    </>
  );
}

export default AdminLayout;

