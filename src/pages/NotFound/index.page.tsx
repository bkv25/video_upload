import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../scss/global.scss";

function NotFoundComponent() {
  const navigate = useNavigate();

  return (
    <>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={10} lg={8} className="text-center">

            {/* Illustration */}
            <div className="d-flex flex-column align-items-center justify-content-center mb-0">
              <h1 className="text-orange mb-0 w-100 d-block fw-bold shadow-3 text-shadow-lg">404</h1>
              <div />
            </div>

            {/* Title */}
            <h2 className="darkk-text mb-3 body-text default-nav-color">Page Not Found</h2>

            {/* Message */}
            <p className="lead text-muted mb-4 font-14">
              The page you are looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Buttons */}
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Button
                size="lg"
                className="px-3 py-2 btn-primary"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>

          </Col>
        </Row>
      </Container>
    </>
  );
}

export default NotFoundComponent;
