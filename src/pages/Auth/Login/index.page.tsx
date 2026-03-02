import { Container } from "react-bootstrap";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../../components/forms/Auth/LoginForm";
import { ImageElement } from "../../../components";
import logger from "../../../utils/logger";
import adminRoutesMap from "../../../routesControl/adminRoutes";
import { adminAuth } from "../../../apiEndPoints";
import apiService from "../../../services/apiService";
import appNotificaton from "../../../utils/notification";
import {
  removeLocalStorage,
  setLocalStorage,
  setLocalStorageToken,
} from "../../../utils/common";
import { loginData } from "../../../redux/AuthSlice/index.slice";
import config from "../../../config";
import { selectThemeImagePath } from "../../../redux/ThemeSlice/index.slice";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const siteLogo = useSelector(selectThemeImagePath);
  const [loading, setLoading] = useState(false);
  const resolvedLogo = siteLogo ? `${config.BACKEND_IMAGE_URL}${siteLogo}` : "";

  const handleSubmit = async (val: LoginFormValues) => {
    setLoading(true);
    try {
      const bodyData: { email: string; password: string } = {
        email: val.email,
        password: val.password,
      };
      const res = (await apiService(adminAuth.login, { bodyData })) as {
        code?: number;
        message?: string;
        data?: {
          user?: Record<string, unknown>;
          accessToken?: string;
          refreshToken?: string;
        };
      };
      if (res?.code === 200) {
        if (val?.rememberMe) {
          setLocalStorage("userCreds", bodyData);
        } else {
          removeLocalStorage("userCreds");
        }
        const userData = {
          ...(res?.data?.user ?? {}),
        };
        if (res?.data?.accessToken) {
          setLocalStorageToken(res.data.accessToken);
        }
        if (res?.data?.refreshToken) {
          setLocalStorage("refreshToken", res.data.refreshToken);
        }
        // Thunk dispatch; ignore type narrowing here to allow async function
        (dispatch as (fn: unknown) => void)(loginData(userData));
        if (res?.message) {
          appNotificaton({ type: "success", message: res.message });
        }
        navigate(adminRoutesMap.DASHBOARD.path);
      }
    } catch (error) {
      logger(error);
    }
    setLoading(false);
  };

  return (
    <>
      <Container className="form-container form-custom-height">
        <div className="brand mb-3">
          <ImageElement
            source="logo.png"
            previewSource={resolvedLogo}
            alt={config.APP_NAME}
            className="logo"
          />
          <div>
            <h5 className="mb-0 fw-normal default-text-color">{config.APP_NAME}</h5>
            <small className="text-muted default-text-color">
              The fun people to safari with!
            </small>
          </div>
        </div>
        <h4 className="mt-5 mb-4 fs-4 fw-semibold default-text-color">
          Welcome Back 👋
        </h4>
        <LoginForm
          onSubmit={handleSubmit}
          loading={loading}
          googleLogin={() => {}}
        />
      </Container>
    </>
  );
};

export default AdminLogin;