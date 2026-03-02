import "./App.css";
import { Suspense, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import config from "./config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { routes } from "./routes";
import ThemeProvider from "./components/ThemeProvider/index.tsx";
import GlobalLoader from "./components/GlobalLoader/index.tsx";

function App() {
  useEffect(() => {
    document.title = config.APP_NAME;
  }, []);

  const RouteLayout = () => {
    const element = useRoutes(routes());
    return element;
  };
  return (
    <>
      <ThemeProvider>
        <GlobalLoader />
        <ToastContainer theme="dark" />
        <Suspense
          fallback={
            <>
              <div className="loader-wrapper  position-fixed w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center">
                <span className="loader" />
              </div>
            </>
          }
        >
          <RouteLayout />
        </Suspense>
      </ThemeProvider>
    </>
  );
}

export default App;
