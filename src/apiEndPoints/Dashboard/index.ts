const dashboardApi = {
  getDashboardData: {
    method: "GET",
    url: "v1/dashboard",
  },
  multipartInit: {
    method: "POST",
    url: "api/multipart-init",
  },
  multipartResume: {
    method: "POST",
    url: "api/multipart-resume",
  },
  multipartComplete: {
    method: "POST",
    url: "api/multipart-complete",
  },
  multipartAbort: {
    method: "POST",
    url: "api/multipart-abort",
  },
  pendingUploads: {
    method: "GET",
    url: "api/pending-uploads",
  },
  uploadStatus: {
    method: "GET",
    url: "api/upload-status",
  },
};

export default dashboardApi;