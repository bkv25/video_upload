import adminRoutesMap from "../../../routesControl/adminRoutes";
import {
  AdminForgotPassword,
  AdminLogin,
  AdminResetPassword,
} from "../../../pages";

export default function route() {
  return [
    {
      path: adminRoutesMap.LOGIN.path,
      element: <AdminLogin />,
      name: "Log In",
      belongsToHeader: true,
      private: false,
      routeAccess: ["admin"],
    },
    {
      path: adminRoutesMap.FORGOT_PASSWORD.path,
      element: <AdminForgotPassword />,
      name: "Forgot Password",
      belongsToHeader: true,
      private: false,
      routeAccess: ["admin"],
    },
    {
      path: `${adminRoutesMap.RESET_PASSWORD.path}/:token`,
      element: <AdminResetPassword />,
      name: "Reset Password",
      belongsToHeader: true,
      private: false,
      routeAccess: ["admin"],
    },
  ];
}
