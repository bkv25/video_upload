// import DashboardRoutes from "./Dashboard/index.routes";
// import DataRoutes from "./Data/index.routes";
// import RolesAndPermissionRoutes from "./RolesAndPermission/index.routes";
// import UserAndStaffRoutes from "./UserAndStaff/index.routes";
// import QuotationRoutes from "./Quotation/index.routes";
// import SettingsRoutes from "./Settings/index.routes";
// import TourRoutes from "./Tour/index.routes";
// import Operations from "./Oprations/index.routes";
import ReservationRoutes from "./Reservation/index.routes";

// export default function route() {
//   return [
//     ...DashboardRoutes(),
//     ...DataRoutes(),
//     ...QuotationRoutes(),
//     ...RolesAndPermissionRoutes(),
//     ...UserAndStaffRoutes(),
//     ...SettingsRoutes(),
//     ...TourRoutes(),
//     ...Operations(),
//   ];
// }

import DashboardRoutes from "./Dashboard/index.routes";
// import DataRoutes from "./Data/index.routes";
// import RolesAndPermissionRoutes from "./RolesAndPermission/index.routes";
// import UserAndStaffRoutes from "./UserAndStaff/index.routes";
// import QuotationRoutes from "./Quotation/index.routes";
// import SettingsRoutes from "./Settings/index.routes";
// import TourRoutes from "./Tour/index.routes";
// import Operations from "./Oprations/index.routes";
// import adminRoutesMap from "../../routesControl/adminRoutes";

export default function route() {
  return [
    ...DashboardRoutes(),
    // ...[
    //   {
    //     path: "/",
    //     // element: <AdminDashboard />,
    //     name: "System Configuration",
    //     // roleKey: rolePermission.dashboard.key,
    //     icon: adminRoutesMap.DASHBOARD.icon,
    //     belongsToHeader: false,
    //     belongsToSidebar: true,
    //     private: true,
    //     children: [
    //     //   ...DataRoutes(),
    //     //   ...RolesAndPermissionRoutes(),
    //     //   ...UserAndStaffRoutes(),
    //     ],
    //   },
    // ],
    // ...QuotationRoutes(),
    // ...TourRoutes(),
    // ...Operations(),
    // ...SettingsRoutes(),
    ...ReservationRoutes(),
  ];
}
