import { Button } from "react-bootstrap";

type CustomButtonProps = React.ComponentProps<typeof Button> & {
  extraClassName?: string;
};

function CustomButton({
  className = "commonBtn",
  extraClassName = "",
  children,
  disabled,
  ...rest
}: CustomButtonProps) {
  return (
    <>
      <Button
        className={` ${extraClassName} ${className}`}
        disabled={disabled}
        {...rest}
      >
        {" "}
        {children}
      </Button>
    </>
  );
}

export default CustomButton;
