const adminAuth = {
    login: {
      method: "POST",
      url: "v1/auth/login",
    },
    logout: {
      method: "POST",
      url: "v1/auth/logout",
    },
    forgotPassowrd: {
      method: "POST",
      url: "v1/auth/forgot-password",
    },
    resetPassowrd: {
      method: "POST",
      url: "v1/users/reset-password",
    },
    googleLogin: {
      method: "POST",
      url: "v1/auth/login/google",
    },
    refreshToken: {
      method: "POST",
      url: "v1/auth/refresh-token",
    },
    getDetailsData:{
      method: "GET",
      url: "v1/settings/site/public",
    }
  };
  
  export default adminAuth;
  