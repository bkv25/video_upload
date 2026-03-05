import React, { useCallback, useState } from "react";
import {
  ACCEPTED_VIDEO_FORMATS,
  ACCEPTED_VIDEO_EXTENSIONS,
} from "./types";

const ACCEPT_STRING = ACCEPTED_VIDEO_FORMATS.join(",");

type UploadZoneProps = {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  isDisabled?: boolean;
  error?: string;
};

const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  selectedFile,
  isDisabled = false,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [invalidTypeError, setInvalidTypeError] = useState<string | null>(null);

  const isValidFile = useCallback((file: File): boolean => {
    const isValidType = ACCEPTED_VIDEO_FORMATS.includes(
      file.type as (typeof ACCEPTED_VIDEO_FORMATS)[number]
    );
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    const isValidExt = ACCEPTED_VIDEO_EXTENSIONS.includes(
      ext as (typeof ACCEPTED_VIDEO_EXTENSIONS)[number]
    );
    return isValidType || isValidExt;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length || isDisabled) return;
      setInvalidTypeError(null);
      const file = files[0];
      if (!isValidFile(file)) {
        setInvalidTypeError("Only MP4 and MOV formats are accepted.");
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    },
    [isDisabled, isValidFile, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDisabled) setIsDragging(true);
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div className="file-upload-zone-wrapper">
      <div
        className={`file-upload-zone ${isDragging ? "is-dragging" : ""} ${
          selectedFile ? "has-file" : ""
        } ${error ? "has-error" : ""} ${isDisabled ? "is-disabled" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
          disabled={isDisabled}
          className="file-upload-input"
          aria-label="Select video file"
        />
        {selectedFile ? (
          <div className="file-upload-selected">
            <span className="file-upload-icon">🎬</span>
            <div className="file-upload-info">
              <span className="file-upload-name">{selectedFile.name}</span>
              <span className="file-upload-size">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
            {!isDisabled && (
              <button
                type="button"
                className="file-upload-remove"
                onClick={() => onFileSelect(null)}
                aria-label="Remove file"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className="file-upload-placeholder">
            <span className="file-upload-icon">📤</span>
            <p className="file-upload-text">
              Drag and drop your video here, or{" "}
              <span className="file-upload-browse">click to browse</span>
            </p>
            <p className="file-upload-hint">
              MP4 and MOV only • Supports files up to 10GB+
            </p>
          </div>
        )}
      </div>
      {(error || invalidTypeError) && (
        <p className="file-upload-error">{error || invalidTypeError}</p>
      )}
    </div>
  );
};

export default UploadZone;
