/**
 * Video upload API - integrates with backend multipart endpoints
 */

import apiService from "../../../../services/apiService";
import dashboardApi from "../../../../apiEndPoints/Dashboard";
import type { VideoMetadata } from "./types";
import { getAdaptiveChunkSize } from "./networkUtils";

type ApiResponse = Record<string, unknown>;

/** multipart-init: Initialize multipart upload. Uses adaptive chunk size based on network. */
export async function multipartInit(
  fileName: string,
  fileSize: number,
  metadata: VideoMetadata
): Promise<{
  uploadId: string;
  fileKey: string;
  chunkSize: number;
  presignedUrls?: Array<{ chunkIndex: number; url: string }>;
}> {
  const chunkSizeBytes = getAdaptiveChunkSize();
  const chunkCount = Math.ceil(fileSize / chunkSizeBytes);

  const res = (await apiService(dashboardApi.multipartInit, {
    bodyData: {
      fileName,
      fileSize,
      chunkCount,
      opponentName: metadata.opponentName,
      gameDate: metadata.gameDate,
      jerseyNumber: metadata.jerseyNumber,
      jerseyColor: metadata.jerseyColor,
    },
    hideGlobalLoader: true,
  })) as ApiResponse;

  const signedUrls = (res?.signedUrls ?? res?.presignedUrls) as
    | Array<{ partNumber?: number; uploadUrl?: string; chunkIndex?: number; url?: string }>
    | undefined;
  const presignedUrls = signedUrls?.map((item) => ({
    chunkIndex: item.partNumber != null ? item.partNumber - 1 : (item.chunkIndex ?? 0),
    url: item.uploadUrl ?? item.url ?? "",
  }));

  return {
    uploadId: String(res?.uploadId ?? ""),
    fileKey: String(res?.fileKey ?? ""),
    chunkSize: Number(res?.chunkSize ?? chunkSizeBytes),
    presignedUrls,
  };
}

/** Backend signedUrls shape: { partNumber, uploadUrl } */
type SignedUrlItem = { partNumber: number; uploadUrl: string };

/**
 * multipart-resume: Get presigned URLs for chunks that still need uploading.
 * Backend returns: { signedUrls: [{ partNumber, uploadUrl }] }
 * @param uploadId - From multipart-init
 * @param fileKey - S3 key from multipart-init (e.g. "uploads/1738345678901-filename.mp4")
 * @param chunkNumbers - 1-indexed part numbers still needed (e.g. [3, 4] if 1 and 2 are done)
 */
export async function multipartResume(
  uploadId: string,
  fileKey: string,
  chunkNumbers: number[]
): Promise<{ presignedUrls: Array<{ chunkIndex: number; url: string }> }> {
  const res = (await apiService(dashboardApi.multipartResume, {
    bodyData: { uploadId, fileKey, chunkNumbers },
    hideGlobalLoader: true,
  })) as ApiResponse;

  const signedUrls = (res?.signedUrls ?? res?.presignedUrls ?? []) as SignedUrlItem[];
  const presignedUrls = signedUrls.map((item) => ({
    chunkIndex: item.partNumber - 1,
    url: item.uploadUrl ?? (item as { url?: string }).url ?? "",
  }));
  return { presignedUrls };
}

/** upload-status: Get upload status (for resume). Requires uploadId and fileKey. */
export async function uploadStatus(
  uploadId: string,
  fileKey: string
): Promise<{
  uploadId: string;
  nextChunkIndex: number;
  totalChunks: number;
  isComplete: boolean;
}> {
  const res = (await apiService(dashboardApi.uploadStatus, {
    queryParams: { uploadId, fileKey },
    hideGlobalLoader: true,
  })) as ApiResponse;

  return {
    uploadId: String(res?.uploadId ?? uploadId),
    nextChunkIndex: Number(res?.nextChunkIndex ?? 0),
    totalChunks: Number(res?.totalChunks ?? 0),
    isComplete: Boolean(res?.isComplete),
  };
}

/** multipart-complete: Finalize upload with uploadId, fileKey, and parts (PartNumber + ETag) */
export async function multipartComplete(
  uploadId: string,
  fileKey: string,
  parts: Array<{ PartNumber: number; ETag: string }>,
  metadata: VideoMetadata
): Promise<void> {
  await apiService(dashboardApi.multipartComplete, {
    bodyData: {
      uploadId,
      fileKey,
      parts,
      opponentName: metadata.opponentName,
      gameDate: metadata.gameDate,
      jerseyNumber: metadata.jerseyNumber,
      jerseyColor: metadata.jerseyColor,
    },
    hideGlobalLoader: true,
  });
}

/** multipart-abort: Abort upload (optional) */
export async function multipartAbort(uploadId: string): Promise<void> {
  await apiService(dashboardApi.multipartAbort, {
    bodyData: { uploadId },
    hideGlobalLoader: true,
  });
}

/** Upload chunk directly to presigned URL (S3/storage). Returns ETag from response. */
export async function uploadChunkToPresignedUrl(
  presignedUrl: string,
  chunkBlob: Blob
): Promise<string> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    body: chunkBlob,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`Chunk upload failed: ${response.status} ${response.statusText}`);
  }

  const etag = response.headers.get("ETag") ?? response.headers.get("etag");
  if (!etag) {
    throw new Error("No ETag in chunk upload response");
  }
  return etag;
}
