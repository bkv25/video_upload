import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "..";
import { Col, Container, Row } from "react-bootstrap";
import AdminSidebar from "../../components/Sidebar";
import AdminHeader from "../../components/Header";

function AdminPrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectpath, setRedirectPath] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleClickSidebar = useCallback((data?: boolean) => {
    setIsOpen((prev) => (data !== undefined ? data : !prev));
  }, []);

  useEffect(() => {
    const open = location.pathname.includes("contract-ai");
    queueMicrotask(() => setIsOpen(open));
  }, [location.pathname]);

  useEffect(() => {
    if (redirectpath) {
      navigate(redirectpath);
    }
  }, [redirectpath, navigate]);

  return (
    <>
      <AppLayout
        setRedirectPath={setRedirectPath}
        // rolePermissionRoute={rolePermissionRoute}
      >
        <Container fluid>
          <Row className={`flex-nowrap ${isOpen ? "sidebar-hide" : ""}`}>
            <Col md={3}>
              <AdminSidebar />
            </Col>
            <Col md={9}>
              <AdminHeader handleClickSidebar={handleClickSidebar} />
              <div className="main-content">
                <div className="main-inner p-3">
                  <Suspense
                    fallback={
                      <>
                        <div className="loader-wrapper  position-fixed w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center">
                          <span className="loader" />
                        </div>
                      </>
                    }
                  >
                    <Outlet />
                  </Suspense>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </AppLayout>
    </>
  );
}

export default AdminPrivateLayout;
