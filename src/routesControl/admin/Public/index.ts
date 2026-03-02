import { baseRoutes } from "../../../helper/baseRoute";

const accessRoutes = {
  LOGIN: { path: `${baseRoutes.admin}` },
  FORGOT_PASSWORD: { path: `${baseRoutes.admin}forgot-password` },
  RESET_PASSWORD: { path: `${baseRoutes.admin}reset-password` },
  // VERIFY_CODE: { path: `${baseRoutes.admin}verify-code` },
};

export default accessRoutes;