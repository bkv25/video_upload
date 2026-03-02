import { baseRoutes } from "../../../../helper/baseRoute";

const accessRoutes = {
  RESERVATION: {
    path: `${baseRoutes.admin}`,
    name: "Reservation",
    icon: "Reservation.svg",
  },
   CHILD_ONE: {
    path: `${baseRoutes.admin}child-one`,
    name: "Child One",
    icon: "Child One.svg",
  },
  CHILD_TWO: {
    path: `${baseRoutes.admin}child-two`,
    name: "Child Two",
    icon: "Child Two.svg",
  },
};

export default accessRoutes;