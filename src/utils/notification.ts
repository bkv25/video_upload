import { toast, type ToastOptions } from "react-toastify";

type AppNotificationArgs = {
  type: ToastOptions["type"];
  message: string;
};

const appNotificaton = ({ type, message }: AppNotificationArgs): void => {
  toast(message, {
    type,
  });
};

export default appNotificaton;
