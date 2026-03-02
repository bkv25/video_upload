import { AdminDashboard } from "../../../pages";
import adminRoutesMap from "../../../routesControl/adminRoutes";
// import { rolePermission } from "../../../helper/rolePermission";

export default function route() {
  return [
    {
      path: adminRoutesMap.DASHBOARD.path,
      element: <AdminDashboard />,
      name: adminRoutesMap.DASHBOARD.name,
      // roleKey: rolePermission.dashboard.key,
      icon: adminRoutesMap.DASHBOARD.icon,
      belongsToHeader: false,
      belongsToSidebar: true,
      private: true,
      routeAccess: ["admin"],
    },
  ];
}
