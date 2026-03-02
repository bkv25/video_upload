import adminPublicRoutes from "./Public";
import adminPrivateRoutes from "./Private";

const AccessControl = {
  ...adminPublicRoutes,
  ...adminPrivateRoutes
};

export default AccessControl;
