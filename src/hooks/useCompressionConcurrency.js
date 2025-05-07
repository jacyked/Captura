// src/hooks/useCompressionConcurrency.js
import { useMemo, useCallback } from 'react';
import resize from '@/app/api/compressFile';

/**
 * Hook that provides a device‑aware concurrency limit and a batch compressor.
 * @returns {{ compressFilesInBatches: function(files, options, onProgress): Promise<FormData> }}
 */
export default function useCompressionConcurrency() {
  // Determine how many files to compress in parallel based on hardware
  const concurrencyLimit = useMemo(() => {
    const cores  = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory      || 4;

    if (cores < 4 || memory < 4) {
      return 2; // low‑end devices
    } else if (cores < 8 || memory < 8) {
      return 3; // mid‑range devices
    } else {
      return 5; // high‑end devices
    }
  }, []);

  /**
   * Compresses files in batches, appends them to a FormData, and calls onProgress.
   *
   * @param {FileList|File[]} files       - the files to compress
   * @param {object}            options   - options for the `resize` function
   * @param {function}          onProgress - callback receiving a 0–1 progress value
   * @returns {Promise<FormData>}
   */
  const compressFilesInBatches = useCallback(
    async (files, options, onProgress) => {
      const formData = new FormData();
      const fileArray = Array.from(files);
      const total = fileArray.length;
      let count = 0;

      for (let i = 0; i < total; i += concurrencyLimit) {
        const batch = fileArray.slice(i, i + concurrencyLimit);

        // Compress the entire batch in parallel
        const compressedBatch = await Promise.all(
          batch.map(async (file) => {
            try {
              return await resize(file, options);
            } catch {
              // Fallback to original if compression fails
              return file;
            }
          })
        );

        // Append results and update progress
        compressedBatch.forEach((compressed) => {
          formData.append('files', compressed);
          count++;
          onProgress(count / total);
        });
      }

      return formData;
    },
    [concurrencyLimit]
  );

  return { compressFilesInBatches };
}