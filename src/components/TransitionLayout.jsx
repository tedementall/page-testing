import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function TransitionLayout() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    setVisible(false);
  }, [location.key]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [location.key]);

  return (
    <div className={`page-transition ${visible ? "is-visible" : ""}`}>
      <Outlet />
    </div>
  );
}
