import React, { type ReactNode } from "react";
import { AdminLayout } from "../layout";
import { NotFoundComponent } from "../pages";
import { adminRoutes } from "./admin";

/** Single route or nested route config used across admin/public/private routes */
export interface RouteEntry {
  path?: string;
  element?: ReactNode;
  name?: string;
  children?: RouteEntry[];
  [key: string]: unknown;
}

export const routes = (): RouteEntry[] => {
  return [
    {
      element: <AdminLayout />,
      children: [...adminRoutes()],
    },
    {
      path: "*",
      element: <NotFoundComponent />,
    },
  ];
};

export const moduleRoutes = (): { admin: RouteEntry[] } => {
  const admin = adminRoutes();
  return {
    admin: [...admin[0].children!, ...admin[1].children!],
  };
};

function getChildData(data: RouteEntry[]): RouteEntry[] {
  const childData: RouteEntry[] = [];
  data.forEach((item) => {
    if (item.children) {
      childData.push(...getChildData(item.children));
    } else {
      childData.push(item);
    }
  });
  return childData;
}

export const getCompleteRouteList = (type = ""): RouteEntry[] => {
  const routesList: RouteEntry[] = [];
  const data = moduleRoutes();

  if (type === "") {
    Object.keys(data).forEach((item) => {
      const key = item as keyof typeof data;
      data[key].forEach((e) => {
        if (e.children) {
          const flat = getChildData(e.children);
          routesList.push(...flat);
        } else {
          routesList.push(e);
        }
      });
    });
  } else {
    const list = data[type as keyof typeof data];
    if (list) {
      list.forEach((e) => {
        if (e.children) {
          const flat = getChildData(e.children);
          routesList.push(...flat);
        } else {
          routesList.push(e);
        }
      });
    }
  }

  return routesList;
};
