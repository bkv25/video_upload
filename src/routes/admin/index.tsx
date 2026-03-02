import React from "react";
import { AdminPublicLayout, AdminPrivateLayout } from "../../layout";
import publicRoutes from "./public.route";
import privateRoutes from "./private.route";

export const adminRoutes = () => {
  return [
    {
      element: <AdminPublicLayout />,
      children: [...publicRoutes()],
    },
    {
      element: <AdminPrivateLayout />,
      children: [...privateRoutes()],
    },
  ];
};
