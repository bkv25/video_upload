import { useState, useEffect } from "react";
import { subscribe } from "../../utils/loaderManager";

const overlayStyle: React.CSSProperties = {
  zIndex: 9999999,
  pointerEvents: "all",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
};

export default function GlobalLoader(): React.ReactElement | null {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    return subscribe(setIsLoading);
  }, []);

  if (!isLoading) return null;

  return (
    <div style={overlayStyle} className="loader-wrapper2">
      <div className="loader-text d-flex align-items-center justify-content-center flex-column gap-2 text-white font-12 fw-normal">
        <span className="loaderAi" />
        Loading
      </div>
    </div>
  );
}
