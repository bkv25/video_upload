import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppLayout from "../app";
import { Col, Row } from "react-bootstrap";
// import "./../../scss/authGlobal/authGlobal.scss";

function AdminPublicLayout() {
  const [redirectPath, setRedirectPath] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath);
    }
  }, [redirectPath, navigate]);

  return (
    <>
      <AppLayout setRedirectPath={setRedirectPath}>
        <div className="login-page">
          <Row className="g-0 full-height">
            <Col md={7} className="image-section d-none d-md-block" />
            <Col
              md={5}
              className="form-section d-flex align-items-center position-relative"
            >
              <Outlet />
            </Col>
          </Row>
        </div>
      </AppLayout>
    </>
  );
}

export default AdminPublicLayout;
