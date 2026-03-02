import AuthRoutes from "./Auth/index.routes";

export default function route() {
  return [...AuthRoutes()];
}