import { lazy } from "react";

export const AdminLogin = lazy(() => import("./Login/index.page"));
export const AdminForgotPassword = lazy(() => import("./ForgotPassword/index.page"));
export const AdminResetPassword = lazy(() => import("./ResetPassword/index.page"));;
