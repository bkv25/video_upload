/**
 * Chunked Upload Hook
 *
 * Supports two strategies (toggle via CHUNK_UPLOAD_STRATEGY below):
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SEQUENTIAL: One chunk at a time (for loop + await)                      │
 * │   • More reliable on unstable networks                                  │
 * │   • Simpler flow, easier to debug                                        │
 * │   • Slower for large files                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ PARALLEL: Multiple chunks concurrently (Promise.all, batch of 3)        │
 * │   • Faster on stable networks                                            │
 * │   • Uses concurrency limit to avoid overwhelming the network             │
 * │   • Slightly more complex (parts collected out of order)                 │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useCallback, useState } from "react";
import type {
  ChunkUploadStrategy,
  UploadPart,
  UploadProgress,
  UploadStatePersisted,
  VideoMetadata,
} from "./types";
import { UPLOAD_STATE_STORAGE_KEY } from "./types";
import { getLocalStorage, setLocalStorage, removeLocalStorage } from "../../../../utils/common";
import {
  multipartInit,
  multipartResume,
  uploadStatus,
  multipartComplete,
  uploadChunkToPresignedUrl,
} from "./uploadApi";
import appNotification from "../../../../utils/notification";

/** Parallel only: max chunks uploaded at once */
const PARALLEL_CONCURRENCY = 3;

const getPersistedState = (): UploadStatePersisted | null => {
  const raw = getLocalStorage(UPLOAD_STATE_STORAGE_KEY);
  if (
    raw &&
    typeof raw === "object" &&
    "uploadId" in raw &&
    "fileKey" in raw &&
    (raw as UploadStatePersisted).fileKey
  ) {
    return raw as UploadStatePersisted;
  }
  return null;
};

const persistState = (state: UploadStatePersisted | null) => {
  if (state) {
    setLocalStorage(UPLOAD_STATE_STORAGE_KEY, {
      ...state,
      updatedAt: Date.now(),
    });
  } else {
    removeLocalStorage(UPLOAD_STATE_STORAGE_KEY);
  }
};

/** Build 0-based chunkIndex -> presignedUrl map from API response */
function buildUrlMap(
  presignedUrls: Array<{ chunkIndex: number; url: string }>,
  /** If true, chunkIndex from backend is 1-based part number */
  oneBased = false
): Map<number, string> {
  const map = new Map<number, string>();
  for (const { chunkIndex, url } of presignedUrls) {
    map.set(oneBased ? chunkIndex - 1 : chunkIndex, url);
  }
  return map;
}

/** Build chunkNumbers array: 1-indexed part numbers still needing upload */
function getChunkNumbersToUpload(
  lastUploadedChunkIndex: number,
  totalChunks: number
): number[] {
  const numbers: number[] = [];
  for (let i = lastUploadedChunkIndex + 1; i < totalChunks; i++) {
    numbers.push(i + 1); // 1-indexed part number
  }
  return numbers;
}

/** Upload one chunk and return { PartNumber, ETag } - used by both strategies */
async function uploadChunkAndGetPart(
  chunkIndex: number,
  url: string,
  chunkBlob: Blob
): Promise<UploadPart> {
  const etag = await uploadChunkToPresignedUrl(url, chunkBlob);
  return { PartNumber: chunkIndex + 1, ETag: etag };
}

/** Shared completion flow: call multipart-complete, clear state, show success */
async function finishUpload(
  uploadId: string,
  fileKey: string,
  parts: UploadPart[],
  metadata: VideoMetadata
): Promise<void> {
  await multipartComplete(uploadId, fileKey, parts, metadata);
  persistState(null);
  appNotification({ type: "success", message: "Video uploaded successfully!" });
}

// -----------------------------------------------------------------------------

export type UseChunkedUploadOptions = {
  /** Upload strategy: 'parallel' (faster) or 'sequential' (more reliable) */
  strategy?: ChunkUploadStrategy;
};

export function useChunkedUpload(options: UseChunkedUploadOptions = {}) {
  const strategy = options.strategy ?? "parallel";

  const [progress, setProgress] = useState<UploadProgress>({
    currentChunk: 0,
    totalChunks: 0,
    percent: 0,
    status: "idle",
  });

  const getChunks = useCallback((file: File, chunkSize: number): Blob[] => {
    const chunks: Blob[] = [];
    let offset = 0;
    while (offset < file.size) {
      chunks.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }
    return chunks;
  }, []);

  // =========================================================================
  // SEQUENTIAL: One chunk at a time (for loop + await)
  // =========================================================================
  const uploadSequential = useCallback(
    async (
      file: File,
      uploadId: string,
      fileKey: string,
      chunkSize: number,
      startFromIndex: number,
      metadata: VideoMetadata,
      urlMap: Map<number, string>,
      existingParts: UploadPart[] = []
    ) => {
      const chunks = getChunks(file, chunkSize);
      const totalChunks = chunks.length;
      const parts: UploadPart[] = [...existingParts];

      // SEQUENTIAL: for loop + await — one chunk at a time
      for (let i = startFromIndex; i < totalChunks; i++) {
        setProgress({
          currentChunk: i,
          totalChunks,
          percent: Math.round(((i + 1) / totalChunks) * 100),
          status: "uploading",
        });

        const url = urlMap.get(i);
        if (!url) throw new Error(`No presigned URL for chunk ${i}`);

        const part = await uploadChunkAndGetPart(i, url, chunks[i]);
        parts.push(part);

        persistState({
          uploadId,
          fileKey,
          fileName: file.name,
          fileSize: file.size,
          lastUploadedChunkIndex: i,
          chunkSize,
          parts,
          updatedAt: Date.now(),
        });
      }

      setProgress((p) => ({ ...p, status: "completing" }));
      await finishUpload(uploadId, fileKey, parts, metadata);
      setProgress((p) => ({ ...p, percent: 100, status: "completed" }));
    },
    [getChunks]
  );

  // =========================================================================
  // PARALLEL: Multiple chunks concurrently (Promise.all, batch of 3)
  // =========================================================================
  const uploadParallel = useCallback(
    async (
      file: File,
      uploadId: string,
      fileKey: string,
      chunkSize: number,
      startFromIndex: number,
      metadata: VideoMetadata,
      urlMap: Map<number, string>,
      existingParts: UploadPart[] = []
    ) => {
      const chunks = getChunks(file, chunkSize);
      const totalChunks = chunks.length;
      const partsMap = new Map<number, string>();
      for (const p of existingParts) {
        partsMap.set(p.PartNumber, p.ETag);
      }
      let lastConfirmedIndex = startFromIndex - 1;

      const uploadChunkInBatch = async (index: number) => {
        const url = urlMap.get(index);
        if (!url) throw new Error(`No presigned URL for chunk ${index}`);
        const part = await uploadChunkAndGetPart(index, url, chunks[index]);
        partsMap.set(part.PartNumber, part.ETag);
        lastConfirmedIndex = Math.max(lastConfirmedIndex, index);
        const parts = Array.from(partsMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([PartNumber, ETag]) => ({ PartNumber, ETag }));
        persistState({
          uploadId,
          fileKey,
          fileName: file.name,
          fileSize: file.size,
          lastUploadedChunkIndex: lastConfirmedIndex,
          chunkSize,
          parts,
          updatedAt: Date.now(),
        });
        setProgress((p) => ({
          ...p,
          currentChunk: lastConfirmedIndex,
          totalChunks,
          percent: Math.round(((lastConfirmedIndex + 1) / totalChunks) * 100),
        }));
      };

      // PARALLEL: Promise.all on batches — multiple chunks at once
      for (let i = startFromIndex; i < totalChunks; i += PARALLEL_CONCURRENCY) {
        const batch = Array.from(
          { length: Math.min(PARALLEL_CONCURRENCY, totalChunks - i) },
          (_, k) => i + k
        );
        await Promise.all(batch.map(uploadChunkInBatch));
      }

      const parts = Array.from(partsMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([PartNumber, ETag]) => ({ PartNumber, ETag }));

      setProgress((p) => ({ ...p, status: "completing" }));
      await finishUpload(uploadId, fileKey, parts, metadata);
      setProgress((p) => ({ ...p, percent: 100, status: "completed" }));
    },
    [getChunks]
  );

  const startUpload = useCallback(
    async (file: File, metadata: VideoMetadata) => {
      setProgress({ currentChunk: 0, totalChunks: 0, percent: 0, status: "uploading" });

      try {
        const persisted = getPersistedState();
        const isResume =
          persisted &&
          persisted.fileName === file.name &&
          persisted.fileSize === file.size;

        let uploadId: string;
        let chunkSize: number;
        let startFromIndex: number;
        let urlMap: Map<number, string>;

        let fileKey: string;

        if (isResume && persisted) {
          uploadId = persisted.uploadId;
          fileKey = persisted.fileKey;
          chunkSize = persisted.chunkSize;
          const status = await uploadStatus(persisted.uploadId, persisted.fileKey);
          startFromIndex = status.nextChunkIndex;

          if (status.isComplete) {
            setProgress((p) => ({ ...p, percent: 100, status: "completed" }));
            persistState(null);
            return;
          }

          const totalChunks = Math.ceil(file.size / chunkSize);
          const chunkNumbers = getChunkNumbersToUpload(
            startFromIndex - 1,
            totalChunks
          );
          const { presignedUrls } = await multipartResume(
            uploadId,
            fileKey,
            chunkNumbers
          );
          urlMap = buildUrlMap(presignedUrls);
        } else {
          const init = await multipartInit(file.name, file.size, metadata);
          uploadId = init.uploadId;
          fileKey = init.fileKey;
          chunkSize = init.chunkSize;
          startFromIndex = 0;

          if (init.presignedUrls?.length) {
            urlMap = buildUrlMap(init.presignedUrls);
          } else {
            const totalChunks = Math.ceil(file.size / chunkSize);
            const chunkNumbers = getChunkNumbersToUpload(-1, totalChunks);
            const { presignedUrls } = await multipartResume(
              uploadId,
              fileKey,
              chunkNumbers
            );
            urlMap = buildUrlMap(presignedUrls);
          }
        }

        const existingParts: UploadPart[] = isResume && persisted?.parts ? persisted.parts : [];

        if (strategy === "sequential") {
          await uploadSequential(
            file,
            uploadId,
            fileKey,
            chunkSize,
            startFromIndex,
            metadata,
            urlMap,
            existingParts
          );
        } else {
          await uploadParallel(
            file,
            uploadId,
            fileKey,
            chunkSize,
            startFromIndex,
            metadata,
            urlMap,
            existingParts
          );
        }
      } catch (err) {
        setProgress((p) => ({
          ...p,
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        }));
      }
    },
    [uploadSequential, uploadParallel, strategy]
  );

  const getInProgressUpload = useCallback((): UploadStatePersisted | null => {
    return getPersistedState();
  }, []);

  const clearProgress = useCallback(() => {
    setProgress({
      currentChunk: 0,
      totalChunks: 0,
      percent: 0,
      status: "idle",
    });
  }, []);

  return {
    progress,
    startUpload,
    getInProgressUpload,
    clearProgress,
    strategy,
  };
}
