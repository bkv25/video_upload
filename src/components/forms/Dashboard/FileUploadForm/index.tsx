import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import "./FileUploadForm.scss";
import CustomButton from "../../../uiElements/common/CustomButton";
import appNotification from "../../../../utils/notification";
import UploadZone from "./UploadZone";
import MetadataForm from "./MetadataForm";
import { useChunkedUpload } from "./useChunkedUpload";
import { getAdaptiveChunkSize, getChunkSizeLabel } from "./networkUtils";
import type { VideoMetadata } from "./types";
import type { ChunkUploadStrategy } from "./types";

const FileUploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<ChunkUploadStrategy>("parallel");
  const hasShownResumeToastRef = useRef(false);

  const {
    progress,
    startUpload,
    getInProgressUpload,
    clearProgress,
    strategy: activeStrategy,
  } = useChunkedUpload({ strategy });

  const inProgressUpload = getInProgressUpload();
  const showResumeAlert = !selectedFile && !!inProgressUpload;

  useEffect(() => {
    if (inProgressUpload && !hasShownResumeToastRef.current) {
      appNotification({
        type: "info",
        message: `Resumable upload detected for "${inProgressUpload.fileName}". Select the same file to resume.`,
      });
      hasShownResumeToastRef.current = true;
    }
  }, [inProgressUpload]);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(
    async (metadata: VideoMetadata) => {
      if (!selectedFile) {
        appNotification({ type: "warning", message: "Please select a video file." });
        return;
      }
      await startUpload(selectedFile, metadata);
    },
    [selectedFile, startUpload]
  );

  const isUploadReady = Boolean(selectedFile);
  const isUploading = progress.status === "uploading" || progress.status === "completing";

  return (
    <div className="file-upload-form">
      <div className="file-upload-form-header">
        <h5 className="mb-0">Upload Game Video</h5>
        <div className="file-upload-strategy-selector">
          <Form.Label className="mb-0 me-2 font-14">Chunk strategy:</Form.Label>
          <Form.Select
            size="sm"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as ChunkUploadStrategy)}
            disabled={isUploading}
            className="file-upload-strategy-select"
          >
            <option value="parallel">Parallel (faster)</option>
            <option value="sequential">Sequential (reliable)</option>
          </Form.Select>
          <span className="file-upload-strategy-badge ms-2">
            Active: <strong>{activeStrategy}</strong>
          </span>
        </div>
      </div>

      <UploadZone
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        isDisabled={isUploading}
      />

      {selectedFile && (
        <p className="file-upload-chunk-info font-14 text-secondary mb-0 mt-2">
          Chunk size: <strong>{getChunkSizeLabel(getAdaptiveChunkSize())}</strong> (auto based on
          network speed)
        </p>
      )}

      <MetadataForm onSubmit={handleSubmit}>
        {({ isValid }) => {
          const canStartUpload = isUploadReady && isValid && !isUploading;
          return (
            <>
              <div className="file-upload-actions mt-4">
                <CustomButton
                  variant="primary"
                  type="submit"
                  className="px-4 py-2"
                  disabled={!canStartUpload}
                >
                  {isUploading ? "Uploading..." : "Start Upload"}
                </CustomButton>
                {progress.status === "completed" && (
                  <CustomButton
                    variant="outline-secondary"
                    type="button"
                    className="ms-2 px-4 py-2"
                    onClick={() => {
                      setSelectedFile(null);
                      clearProgress();
                    }}
                  >
                    Upload Another
                  </CustomButton>
                )}
              </div>

              {progress.status !== "idle" && (
                <div className="file-upload-progress mt-3">
                  <Form.Label className="font-14 mb-1">Upload Progress</Form.Label>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar ${
                        progress.status === "completed"
                          ? "bg-success"
                          : progress.status === "error"
                            ? "bg-danger"
                            : ""
                      }`}
                      role="progressbar"
                      style={{ width: `${progress.percent}%` }}
                      aria-valuenow={progress.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-1 font-14 text-secondary">
                    <span>
                      Chunk {progress.currentChunk + 1} of {progress.totalChunks || 1}
                    </span>
                    <span>{progress.percent}%</span>
                  </div>
                  {progress.status === "error" && progress.error !== undefined && (
                    <p className="text-danger font-14 mt-1 mb-0">{progress.error}</p>
                  )}
                </div>
              )}
            </>
          );
        }}
      </MetadataForm>

      {showResumeAlert && (
        <div className="alert alert-info mt-3 font-14" role="alert">
          You have an in-progress upload. Select the same video file to resume from where
          you left off.
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
