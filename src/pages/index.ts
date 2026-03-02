import { lazy } from "react";

export * from "./Auth";
export * from "./Reservation";
export const AdminDashboard = lazy(() => import("./Dashboard/index.page"));
export const NotFoundComponent = lazy(() => import("./NotFound/index.page"));