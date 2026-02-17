/**
 * Download service — calls /api/download which works both locally
 * (via Vite proxy → Express) and in production (Vercel serverless function).
 */

/**
 * Trigger a video download.
 *
 * @param {string} videoId — YouTube video ID
 * @param {object} option  — format option from DOWNLOAD_OPTIONS
 */
export function triggerDownload(videoId, option) {
  const params = new URLSearchParams({
    v: videoId,
    quality: option.quality,
    format: option.format,
  })

  // Use relative URL — works on both localhost (via Vite proxy) and Vercel
  window.open(`/api/download?${params}`, '_blank')
}

/** Available download options for the UI */
export const DOWNLOAD_OPTIONS = [
  { label: 'MP4 — Standard (360p)',   quality: '360',  format: 'mp4' },
  { label: 'MP4 — Best (Max 720p)',   quality: '720',  format: 'mp4' },
  { label: 'MP3 — Audio Only',        quality: 'best', format: 'mp3' },
]
