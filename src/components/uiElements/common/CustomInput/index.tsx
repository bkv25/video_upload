import { useField } from "formik";
import React from "react";
import { Form } from "react-bootstrap";
import appNotification from "../../../../utils/notification";
import { convertNumber } from "../../../../utils/common";
import IconTheme from "../IconTheme";

type InputWrapperProps = React.PropsWithChildren<{
  isPassword?: boolean;
  isError?: boolean;
}>;

const InputWrapper = ({ isPassword, isError, children }: InputWrapperProps) => {
  return isPassword ? (
    <div className={`position-relative ${isError ? "is-invalid " : ""}`}>
      {children}
    </div>
  ) : (
    <>{children}</>
  );
};

type FormikLike = {
  setFieldValue: (field: string, value: unknown) => void;
  handleChange: (e: unknown) => void;
};

export type CustomInputProps = Omit<
  React.ComponentProps<typeof Form.Control>,
  "name" | "type" | "onChange" | "value"
> & {
  name: string;
  type?: string;
  placeholder?: string;
  formik: FormikLike;
  callback?: (e: unknown) => void;
  label?: string;
  autoComplete?: string;
  labelClassname?: string;
  allowedType?: string[];
  refer?: React.RefObject<HTMLInputElement>;
  showError?: boolean;
  isMultiple?: boolean;
  inputType?: string;
  isPassword?: boolean;
  isNumber?: boolean;
  regex?: RegExp;
  uppercase?: boolean;
  isIcon?: boolean;
  isRequired?: boolean;
  maxValue?: unknown;
  showPassword?: () => void;
  openIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
  inputExtraValue?: string;
  inputIcon?: React.ReactNode;
};

function CustomInput({
  name,
  type = "text",
  placeholder,
  formik,
  callback,
  label = "",
  autoComplete = "none",
  labelClassname = "",
  allowedType = [],
  refer,
  showError = true,
  isMultiple = false,
  inputType = "",
  isPassword = false,
  isNumber = true,
  regex,
  uppercase = false,
  isIcon = true,
  isRequired = true,
  showPassword,
  inputExtraValue = "",
  inputIcon,
  ...rest
}: CustomInputProps) {
  const [, meta] = useField(name);
  const handleChange = (
    val: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (val?.target?.type === "file") {
      if (allowedType?.length > 0 && val?.target?.files?.[0]) {
        if (!allowedType.includes(val?.target?.files[0]?.type)) {
          appNotification({
            type: "warning",
            message: `This file type is not allowed`,
          });
          return;
        }
      }
      if (isMultiple) {
        if (val.target.files && val.target.files[0]) {
          const current = Array.isArray(meta?.value) ? meta.value : [];
          const data = [...current, ...Array.from(val.target.files)];
          formik.setFieldValue(name, data);
        }
      } else if (val.target.files && val.target.files[0]) {
        formik.setFieldValue(name, val.target.files[0]);
      }
    } else {
      if (type === "tel" || type === "number") {
        const data = regex || /^\d*$/;

        if (data.test(val.target.value || "")) {
          if (isNumber) {
            formik.setFieldValue(
              name,
              val.target.value ? convertNumber(val.target.value) : ""
            );
          } else {
            formik?.handleChange(val);
          }
        }
        // else {
        //   formik.setFieldValue(name, "");
        // }
        // return;
      } else {
        if (inputType === "password") {
          formik?.handleChange(val);
        } else {
          const data = regex;
          if (uppercase) {
            val.target.value = val.target.value?.toUpperCase();
          }
          if (data) {
            if (data.test(val?.target?.value) || val?.target?.value === "") {
              formik?.handleChange(val);
            }
          } else {
            formik?.handleChange(val);
          }
        }
      }
    }
    if (callback) {
      callback(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key, ctrlKey, metaKey } = e;
    const value = e.currentTarget.value;
    const dataRegex = regex || /^\d*$/;

    if (
      (ctrlKey || metaKey) &&
      ["a", "c", "v", "x", "z", "y"].includes(key.toLowerCase())
    ) {
      return;
    }

    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)
    ) {
      return;
    }
    if (dataRegex.test(key)) {
      if (value.includes(".")) {
        const [, dec] = value.split(".");
        const match = dataRegex.toString().match(/\\d\{0,(\d+)\}/);
        const maxDecimals = match ? parseInt(match[1], 10) : 0;
        if (
          dec.length >= maxDecimals &&
          (e.currentTarget.selectionStart ?? 0) > value.indexOf(".")
        ) {
          e.preventDefault();
        }
      }
      return;
    }
    if (key === "." && !value.includes(".")) {
      return;
    }

    e.preventDefault();
  };

  return (
    <>
      <InputWrapper
        isPassword={inputType === "password"}
        isError={Boolean(meta?.error && meta?.touched && showError)}
      >
        {label && (
          <Form.Label className={`common-label ${labelClassname}`}>
            {label} {isRequired && <sup className="text-red">*</sup>}
          </Form.Label>
        )}
        {type === "file" ? (
          <Form.Control
            type={type}
            placeholder={placeholder}
            name={name}
            id={name}
            ref={refer}
            //   value={meta?.value}
            onChange={handleChange}
            isInvalid={Boolean(meta?.error && meta?.touched)}
            autoComplete={autoComplete}
            {...rest}
          />
        ) : (
          <>
            {inputIcon}
            <Form.Control
              type={inputType === "password" && isPassword ? "text" : type}
              placeholder={placeholder}
              name={name}
              ref={refer}
              value={
                inputExtraValue && meta?.value
                  ? `${meta?.value} ${inputExtraValue}`
                  : meta?.value
              }
              onChange={handleChange}
              isInvalid={Boolean(meta?.error && meta?.touched)}
              autoComplete={autoComplete}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (type === "tel") {
                  handleKeyDown(e);
                }
                return;
              }}
              onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                if (type === "tel") {
                  const paste = e.clipboardData.getData("text");
                  const dataRegex = regex || /^\d*$/;
                  if (!dataRegex.test(paste)) {
                    e.preventDefault();
                  }
                }
              }}
              {...rest}
            />
            {isIcon && inputType === "password" && (
              <>
                <IconTheme
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    showPassword?.();
                  }}
                  className={`eye-img ${isPassword ? "active" : ""}`}
                  name="eye.svg"
                />
              </>
            )}
          </>
        )}
      </InputWrapper>
      {meta?.error && meta?.touched && showError && (
        <Form.Control.Feedback className="d-block" type="invalid">
          {meta?.error}
        </Form.Control.Feedback>
      )}
    </>
  );
}

export default CustomInput;
