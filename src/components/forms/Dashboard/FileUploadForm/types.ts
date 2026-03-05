/**
 * File Upload Form - Type definitions
 * Supports chunked/resumable uploads for 10GB+ video files
 */

/** Accepted video formats (MP4, MOV only) */
export const ACCEPTED_VIDEO_FORMATS = ["video/mp4", "video/quicktime"] as const;
export const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov"] as const;

/** Local storage key for in-progress upload state (non-sensitive) */
export const UPLOAD_STATE_STORAGE_KEY = "video_upload_in_progress";

/** Player attributes storage key (for jersey number/color pre-fill) */
export const PLAYER_ATTRIBUTES_STORAGE_KEY = "player_attributes";

/** Chunk upload strategy: 'parallel' | 'sequential' */
export type ChunkUploadStrategy = "parallel" | "sequential";

/** Part info for multipart-complete (S3 requires PartNumber + ETag) */
export interface UploadPart {
  PartNumber: number;
  ETag: string;
}

/** Minimal upload state persisted in local storage */
export interface UploadStatePersisted {
  uploadId: string;
  /** S3 key from multipart-init (e.g. "uploads/1738345678901-filename.mp4") */
  fileKey: string;
  fileName: string;
  fileSize: number;
  lastUploadedChunkIndex: number;
  /** Chunk size in bytes (needed for resume to split file) */
  chunkSize: number;
  /** ETags for completed chunks (needed for multipart-complete on resume) */
  parts?: UploadPart[];
  /** Timestamp when upload was last updated */
  updatedAt: number;
}

/** Metadata required before upload can start */
export interface VideoMetadata {
  opponentName: string;
  gameDate: string;
  jerseyNumber: string;
  jerseyColor: string;
}

/** Player attributes (saved for pre-fill) */
export interface PlayerAttributes {
  jerseyNumber?: string;
  jerseyColor?: string;
}

/** Presigned URL for a chunk (S3/storage direct upload) */
export interface PresignedChunk {
  chunkIndex: number;
  url: string;
}

/** INIT API response shape */
export interface InitUploadResponse {
  uploadId: string;
  chunkSize: number;
  /** Presigned URLs for chunks (indexed by chunkIndex) */
  presignedUrls?: PresignedChunk[];
}

/** RESUME API response shape */
export interface ResumeUploadResponse {
  presignedUrls: PresignedChunk[];
}

/** STATUS API response shape */
export interface UploadStatusResponse {
  uploadId: string;
  nextChunkIndex: number;
  totalChunks: number;
  isComplete: boolean;
}

/** Upload progress state */
export interface UploadProgress {
  currentChunk: number;
  totalChunks: number;
  percent: number;
  status: "idle" | "uploading" | "completing" | "completed" | "error";
  error?: string;
}
