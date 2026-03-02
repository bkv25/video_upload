import { lazy } from "react";

export const ChildOne = lazy(() => import("./ChildOne/index.page"));
export const ChildTwo = lazy(() => import("./ChildTwo/index.page"));