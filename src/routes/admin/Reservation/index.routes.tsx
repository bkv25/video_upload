// import { CheckServicesPage } from "../../../pages/Oprations";
import { ChildOne, ChildTwo } from "../../../pages";
import adminRoutesMap from "../../../routesControl/adminRoutes";
// import { rolePermission } from "../../../helper/rolePermission";

export default function route() {
  return [
    {
      path: adminRoutesMap.RESERVATION.path,
      // element: <AdminDashboard />,
      name: adminRoutesMap.RESERVATION.name,
      // roleKey: rolePermission.dashboard.key,
      icon: adminRoutesMap.RESERVATION.icon,
      belongsToHeader: false,
      belongsToSidebar: true,
      private: true,
      // routeAccess: ["admin"],
      children: [
        {
          path: adminRoutesMap.CHILD_ONE.path,
          name: adminRoutesMap.CHILD_ONE.name,
          element: <ChildOne />,
          belongsToHeader: true,
          belongsToSidebar: true,
          private: false,
        },
        {
            path: adminRoutesMap.CHILD_TWO.path,
            name: adminRoutesMap.CHILD_TWO.name,
            element: <ChildTwo />,
            belongsToHeader: true,
            belongsToSidebar: true,
            private: false,
          }
      ],
    },
  ];
}
