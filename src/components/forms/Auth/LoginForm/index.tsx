import { Formik, Form as FormikForm } from "formik";
import { useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { getLocalStorage } from "../../../../utils/common";
import * as yup from "yup";
import { Link } from "react-router-dom";
import adminRoutesMap from "../../../../routesControl/adminRoutes";
import { IconTheme, ImageElement } from "../../../uiElements";
import CustomInput from "../../../uiElements/common/CustomInput";
import CustomButton from "../../../uiElements/common/CustomButton";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  loading: boolean;
  googleLogin: () => void;
};

function LoginForm({ onSubmit, loading, googleLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const userCreds = getLocalStorage("userCreds") as
    | { email?: string; password?: string }
    | null
    | false;

  const initialValues = useMemo<LoginFormValues>(() => {
    const creds =
      userCreds && typeof userCreds === "object" ? userCreds : ({} as { email?: string; password?: string });
    return {
      email: creds.email || "",
      password: creds.password || "",
      rememberMe: false,
    };
  }, [userCreds]);

  const schema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Email is required"),
    password: yup.string().trim().required("Password is required"),
  });

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <>
      <Formik<LoginFormValues>
        onSubmit={(values) => {
          onSubmit(values);
        }}
        validationSchema={schema}
        initialValues={{ ...initialValues }}
        enableReinitialize
      >
        {(props) => {
          return (
            <FormikForm>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label className="font-14 mb-1">Email</Form.Label>
                <div className="input-with-icon">
                  <IconTheme
                    className="first-img"
                    name="emailIcon.svg"
                  />

                  {/* <Form.Control
                    className="defaultInput rounded-3"
                    type="email"
                    placeholder="admin@yourmail.com"
                  /> */}
                  <CustomInput
                    type="text"
                    className="defaultInput rounded-3"
                    placeholder="Enter your Email"
                    name="email"
                    formik={props}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label className="font-14 mb-1">Password</Form.Label>
                <div className="input-with-icon">
                  <IconTheme
                    className="first-img"
                    name="lockPassword.svg"
                  />
                  {/* <Form.Control
                    className="defaultInput rounded-3"
                    type="password"
                    placeholder="Enter Password"
                  /> */}
                  <CustomInput
                    type="password"
                    className="defaultInput rounded-3"
                    placeholder="Enter Password"
                    // label="Password"
                    name="password"
                    formik={props}
                    inputType="password"
                    isPassword={showPassword}
                    showPassword={handleShowPassword}
                  />
                  {/* <ImageElement className="eye-img " source="eye.svg" alt="" /> */}
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div className="toggle-box d-flex gap-2 align-items-center font-14 default-text-color">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        props.setFieldValue("rememberMe", e?.target?.checked);
                      }}
                    />
                    <span className="slider" />
                  </label>
                  Remember me
                </div>
                <Link
                  to={adminRoutesMap.FORGOT_PASSWORD.path}
                  className="text-orange fw-semibold font-14"
                >
                  Forgot password?
                </Link>
              </div>

              <CustomButton
                variant="primary"
                type="submit"
                className="w-100 mt-2 py-2 login-btn radius-10 d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                Sign in
              </CustomButton>

              <div className="text-center my-4 py-1 or-text position-relative">
                <span className="d-inline-block bg-white position-relative z-2 font-14">
                  Or{" "}
                </span>{" "}
              </div>

              <CustomButton
                type="button"
                variant="light"
                className="w-100 google-btn login-btn radius-10 d-flex justify-content-center align-items-center mt-3"
                disabled={loading}
                onClick={googleLogin}
              >
                <ImageElement source="google.svg" alt="Google" />
                <span>Sign in with Google</span>
              </CustomButton>
            </FormikForm>
          );
        }}
      </Formik>
    </>
  );
}

export default LoginForm;
