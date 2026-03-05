import React, { useMemo } from "react";
import { Formik, Form as FormikForm } from "formik";
import { Form } from "react-bootstrap";
import * as yup from "yup";
import type { FormikHelpers } from "formik";
import CustomInput from "../../../uiElements/common/CustomInput";
import type { VideoMetadata, PlayerAttributes } from "./types";
import { PLAYER_ATTRIBUTES_STORAGE_KEY } from "./types";
import { getLocalStorage } from "../../../../utils/common";

type MetadataFormProps = {
  onSubmit: (values: VideoMetadata) => void | Promise<void>;
  children: (props: {
    isValid: boolean;
    values: VideoMetadata;
  }) => React.ReactNode;
};

const getPlayerAttributes = (): PlayerAttributes => {
  const stored = getLocalStorage(PLAYER_ATTRIBUTES_STORAGE_KEY) as
    | PlayerAttributes
    | null
    | false;
  if (stored && typeof stored === "object") {
    return stored;
  }
  return {};
};

const schema = yup.object().shape({
  opponentName: yup.string().trim().required("Opponent name is required"),
  gameDate: yup.string().trim().required("Game date is required"),
  jerseyNumber: yup.string().trim().required("Jersey number is required"),
  jerseyColor: yup.string().trim().required("Jersey color is required"),
});

const MetadataForm: React.FC<MetadataFormProps> = ({ onSubmit, children }) => {
  const playerAttrs = useMemo(() => getPlayerAttributes(), []);

  const initialValues: VideoMetadata = useMemo(
    () => ({
      opponentName: "",
      gameDate: "",
      jerseyNumber: playerAttrs.jerseyNumber ?? "",
      jerseyColor: playerAttrs.jerseyColor ?? "",
    }),
    [playerAttrs.jerseyNumber, playerAttrs.jerseyColor]
  );

  const handleSubmit = (values: VideoMetadata, helpers: FormikHelpers<VideoMetadata>) => {
    onSubmit(values);
    helpers.setSubmitting(false);
  };

  return (
    <Formik<VideoMetadata>
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <FormikForm>
          <div className="metadata-form-grid">
            <Form.Group className="mb-3" controlId="opponentName">
              <Form.Label className="font-14 mb-1">
                Opponent Name <sup className="text-danger">*</sup>
              </Form.Label>
              <CustomInput
                type="text"
                className="defaultInput rounded-3"
                placeholder="Enter opponent name"
                name="opponentName"
                formik={formikProps}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="gameDate">
              <Form.Label className="font-14 mb-1">
                Game Date <sup className="text-danger">*</sup>
              </Form.Label>
              <CustomInput
                type="date"
                className="defaultInput rounded-3"
                placeholder="Select game date"
                name="gameDate"
                formik={formikProps}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="jerseyNumber">
              <Form.Label className="font-14 mb-1">
                Jersey Number <sup className="text-danger">*</sup>
              </Form.Label>
              <CustomInput
                type="text"
                className="defaultInput rounded-3"
                placeholder="e.g. 10"
                name="jerseyNumber"
                formik={formikProps}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="jerseyColor">
              <Form.Label className="font-14 mb-1">
                Jersey Color <sup className="text-danger">*</sup>
              </Form.Label>
              <CustomInput
                type="text"
                className="defaultInput rounded-3"
                placeholder="e.g. Blue, Red"
                name="jerseyColor"
                formik={formikProps}
              />
            </Form.Group>
          </div>
          {children({
            isValid: formikProps.isValid,
            values: formikProps.values,
          })}
        </FormikForm>
      )}
    </Formik>
  );
};

export default MetadataForm;
