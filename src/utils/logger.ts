import config from "../config";

const logger = (arg: unknown): boolean => {
  if (config.NODE_ENV !== "production") {
    console.log(arg);
  }
  return false;
};

export default logger;
