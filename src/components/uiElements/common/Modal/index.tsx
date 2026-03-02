import { Modal } from "react-bootstrap";

type ModalComponentProps = React.ComponentProps<typeof Modal> & {
  show: boolean;
  handleHide: () => void;
  title?: React.ReactNode;
  isHeader?: boolean;
};

function ModalComponent({
  show,
  handleHide,
  title,
  isHeader = true,
  backdrop = "static",
  children,
  ...rest
}: ModalComponentProps) {
  return (
    <>
      <Modal
        className="common-modal"
        show={show}
        onHide={handleHide}
        centered
        backdrop={backdrop}
        {...rest}
      >
        {isHeader && (
          <Modal.Header closeButton>
            <Modal.Title>
              <h5>{title}</h5>
            </Modal.Title>
          </Modal.Header>
        )}
        <Modal.Body>{children}</Modal.Body>
      </Modal>
    </>
  );
}

export default ModalComponent;
