// import dataRoutes from "./Data";
// import quotationRoutes from "./Quotation";
// import settingRoutes from "./Setting";
// import tourRoutes from "./Tour";
// import  operationRoutes from "./Oprations";
import ReservationRoutes from "./Reservation";
import { baseRoutes } from "../../../helper/baseRoute";

const accessRoutes = {
  DASHBOARD: {
    path: `${baseRoutes.admin}dashboard`,
    name: "Dashboard",
    icon: "dashboard.svg",
  },
//   ROLESANDPERMISSION: {
//     path: `${baseRoutes.admin}roles-permission`,
//     name: "Roles & Permissions",
//     icon: "rolesRes.svg",
//   },
//   USERSANDSTAFF: {
//     path: `${baseRoutes.admin}users-staff`,
//     name: "User/Staff",
//     icon: "user.svg",
//   },
//   ...dataRoutes,
//   ...quotationRoutes,
//   ...tourRoutes,
//   ...operationRoutes,
//   ...settingRoutes,
...ReservationRoutes,
};

export default accessRoutes;
