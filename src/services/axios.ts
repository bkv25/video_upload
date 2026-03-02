import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import {
  getLocalStorage,
  getLocalStorageToken,
  setLocalStorage,
  setLocalStorageToken,
} from "../utils/common.tsx";
import appNotificaton from "../utils/notification";
import config from "../config";
import logger from "../utils/logger";
import apiService from "./apiService";
import { adminAuth } from "../apiEndPoints";
import adminRoutesMap from "../routesControl/adminRoutes";
import { showLoader, hideLoader } from "../utils/loaderManager";

// Track recent error messages to avoid duplicate notifications in a short window
const recentErrorMessagesMap = new Map<string, number>();
const SHOULD_SHOW_ERROR_WINDOW_MS = 2500;

function shouldShowErrorOnce(message: unknown): boolean {
  try {
    const key = String(message || "UNKNOWN_ERROR");
    const now = Date.now();
    const lastShownAt = recentErrorMessagesMap.get(key) || 0;
    if (now - lastShownAt > SHOULD_SHOW_ERROR_WINDOW_MS) {
      recentErrorMessagesMap.set(key, now);
      // Best-effort cleanup to keep the map small
      if (recentErrorMessagesMap.size > 50) {
        const threshold = now - SHOULD_SHOW_ERROR_WINDOW_MS * 2;
        for (const [k, v] of recentErrorMessagesMap.entries()) {
          if (v < threshold) recentErrorMessagesMap.delete(k);
        }
      }
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

// Ensure we don't trigger multiple redirects or refresh flows concurrently
let isAuthRedirecting = false;
let isRefreshingToken = false;

export type ServiceRequestConfig = {
  method?: AxiosRequestConfig["method"];
  formHeaders?: Record<string, string>;
  baseURL?: string;
  url?: string;
  queryParams?: Record<string, unknown>;
  formData?: FormData | Record<string, unknown>;
  bodyData?: Record<string, unknown>;
  cancelFunction?: (cancel: (reason?: string) => void) => void;
  removeHeaders?: boolean;
  cancelRequest?: AbortController;
  extraToken?: string;
  responseType?: AxiosRequestConfig["responseType"];
  hideGlobalLoader?: boolean;
  hideErrorNotification?: boolean;
  showGlobalLoaderOnFormData?: boolean;
};

export const ServiceRequest = async ({
  method,
  formHeaders,
  baseURL,
  url,
  queryParams,
  formData,
  bodyData,
  cancelFunction,
  removeHeaders,
  cancelRequest,
  extraToken = "",
  responseType,
  hideGlobalLoader = false,
  hideErrorNotification = false,
  showGlobalLoaderOnFormData = false,
}: ServiceRequestConfig): Promise<AxiosResponse["data"]> => {
  // Auto-hide global loader for file uploads (they have custom loaders), unless opted in
  const isFileUpload = !!formData;
  const shouldShowLoader =
    !hideGlobalLoader && (!isFileUpload || showGlobalLoaderOnFormData);
  
  if (shouldShowLoader) showLoader();

  try {
    const apiToken = extraToken || getLocalStorageToken();
    const axiosConfig: AxiosRequestConfig = {
      method: method || "GET",
      baseURL: config.API_BASE_URL,
      headers: {
        "content-type": "application/json",
      },
    };
    if (formHeaders) {
      axiosConfig.headers = { ...axiosConfig.headers, ...formHeaders };
    }

    if (baseURL) {
      axiosConfig.baseURL = baseURL;
    }

    if (responseType) {
      axiosConfig.responseType = responseType;
    }

    if (url) {
      axiosConfig.url = url;
    }

    if (queryParams) {
      const queryParamsPayload: Record<string, unknown> = {};
      for (const key in queryParams) {
        if (Object.hasOwnProperty.call(queryParams, key)) {
          let element = queryParams[key];
          if (typeof element === "string") {
            element = element.trim();
          }
          const isNaNNumber =
            typeof element === "number" && Number.isNaN(element);
          if (element !== undefined && !isNaNNumber) {
            queryParamsPayload[key] = element;
          }
        }
      }
      axiosConfig.params = queryParamsPayload;
    }

    if (bodyData) {
      const bodyPayload: Record<string, unknown> = {};
      for (const key in bodyData) {
        if (Object.hasOwnProperty.call(bodyData, key)) {
          let element = bodyData[key];
          if (typeof element === "string") {
            element = element.trim();
          }
          const isNaNNumber =
            typeof element === "number" && Number.isNaN(element);
          if (element !== undefined && !isNaNNumber) {
            bodyPayload[key] = element;
          }
        }
      }
      axiosConfig.data = bodyPayload;
    }

    if (formData) {
      axiosConfig.data = formData;
    }

    if (cancelFunction) {
      axiosConfig.cancelToken = new axios.CancelToken((cancel) => {
        cancelFunction(cancel);
      });
    }

    if (cancelRequest) {
      axiosConfig.signal = cancelRequest.signal;
    }

    if (removeHeaders) {
      delete axiosConfig.headers;
    }

    if (apiToken) {
      axiosConfig.headers = {
        ...(axiosConfig.headers || {}),
        authorization: `Bearer ${apiToken}`,
      };
    }

    const res = await axios(axiosConfig);
    return res.data;
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      request?: { status?: number };
      response?: { data?: { message?: string; error?: string } };
    };
    if (axios?.isCancel(err)) {
      logger(err?.message);

      // appNotificaton({
      //   type: "error",
      //   message: error?.message,
      // });
      // throw error; // Re-throw canceled errors immediately
    } else {
      const errorMessage = err?.response?.data?.message || err?.message;
      const isDeactivatedAccount =
        (err?.request?.status === 401 &&
          err?.response?.data?.message !== "Invalid credentials") ||
        err?.request?.status === 498 ||
        err?.request?.status === 499;
      if (err?.request?.status !== 440 && !isDeactivatedAccount) {
        if (!hideErrorNotification && shouldShowErrorOnce(errorMessage)) {
          appNotificaton({
            type: "error",
            message: errorMessage || "Something went wrong",
          });
        }
      }
      if (
        (err?.request?.status === 401 &&
          err?.response?.data?.message !== "Invalid credentials") ||
        err?.request?.status === 498 ||
        err?.request?.status === 499
      ) {
        if (!isAuthRedirecting) {
          isAuthRedirecting = true;
          // Show toast message before redirecting
          appNotificaton({
            type: "error",
            message:
              "Your account has been deactivated. Please contact your administrator for assistance.",
          });
          // Small delay to ensure toast is visible before redirect
          setTimeout(() => {
            localStorage.clear();
            const url =
              window.location.pathname.search("admin") > 0 ? "/admin" : "/";
            window.location.replace(url);
            window.open("/");
          }, 3000);
        }
        // if (store) {
        //   store.dispatch(logoutAction());
        // }
      } else if (err?.request?.status === 440) {
        if (!isRefreshingToken) {
          isRefreshingToken = true;
          const refreshToken = getLocalStorage("refreshToken");
          const bodyData = { refreshToken };
          const res = (await apiService(adminAuth.refreshToken, {
            bodyData,
            hideGlobalLoader: true,
          })) as {
            status?: string;
            data?: { accessToken?: string; refreshToken?: string };
          };
          if (res.status === "success") {
            if (res.data?.accessToken) {
              setLocalStorageToken(res.data.accessToken);
            }
            if (res.data?.refreshToken) {
              setLocalStorage("refreshToken", res.data.refreshToken);
            }
            setTimeout(() => {
              window?.location?.reload();
            }, 300);
          }
          isRefreshingToken = false;
        }
      } else if (err?.response?.data?.error === "vendor_setup_required") {
        const settingLicensePath = (
          adminRoutesMap as { SETTING_LICENSE?: { path: string } }
        ).SETTING_LICENSE?.path;
        if (settingLicensePath) {
          window.location.replace(settingLicensePath);
        }
      }
    }
    throw error;
  } finally {
    if (shouldShowLoader) hideLoader();
  }
};
