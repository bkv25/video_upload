import logger from "../utils/logger";
import { ServiceRequest } from "./axios";

type ServiceRequestConfig = Parameters<typeof ServiceRequest>[0];

const apiService = async (
  endPoint: ServiceRequestConfig,
  data?: Partial<ServiceRequestConfig>
): Promise<unknown> => {
  try {
    const payload: ServiceRequestConfig = { ...endPoint };
    if (data?.bodyData) {
      payload.bodyData = data?.bodyData;
    }
    if (data?.formData) {
      payload.formData = data?.formData;
    }
    if (data?.queryParams) {
      payload.queryParams = data?.queryParams;
    }
    if (data?.formHeaders) {
      payload.formHeaders = data?.formHeaders;
    }
    if (data?.cancelRequest) {
      payload.cancelRequest = data?.cancelRequest;
    }
    if (data?.baseURL) {
      payload.baseURL = data?.baseURL;
    }
    if (data?.extraToken) {
      payload.extraToken = data?.extraToken;
    }
    if (data?.responseType) {
      payload.responseType = data?.responseType;
    }
    if (data?.hideGlobalLoader !== undefined) {
      payload.hideGlobalLoader = data?.hideGlobalLoader;
    }
    if (data?.showGlobalLoaderOnFormData !== undefined) {
      payload.showGlobalLoaderOnFormData = data?.showGlobalLoaderOnFormData;
    }
    if (data?.hideErrorNotification !== undefined) {
      payload.hideErrorNotification = data?.hideErrorNotification;
    }
    payload.cancelFunction = () => {};
    const res = await ServiceRequest(payload);
    return res;
  } catch (error) {
    logger(error);
    throw (error instanceof Error ? error : new Error(String(error)));
  }
};

export default apiService;
