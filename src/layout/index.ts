import { lazy } from "react";

export const AppLayout = lazy(() => import("./app"));
export const AdminLayout = lazy(() => import("./admin"));
export const AdminPrivateLayout = lazy(() => import("./admin/index.private"));
export const AdminPublicLayout = lazy(() => import("./admin/index.public"));
