// Remove static import
// const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

function getApiKey() {
  const key = localStorage.getItem('yt_api_key')
  if (!key) throw new Error('API Key missing')
  return key
}

/**
 * Fetch most popular videos
 */
export async function fetchPopularVideos(maxResults = 20, categoryId = '0') {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    chart: 'mostPopular',
    regionCode: 'IN',
    maxResults: String(maxResults),
    key: getApiKey(),
  })

  if (categoryId !== '0') {
    params.set('videoCategoryId', categoryId)
  }

  const res = await fetch(`${BASE_URL}/videos?${params}`)
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  const data = await res.json()
  return data.items.map(formatVideo)
}

/**
 * Search videos by query
 */
export async function searchVideos(query, maxResults = 20) {
  if (!query?.trim()) return []

  // Step 1: search for video IDs
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(maxResults),
    key: getApiKey(),
  })

  const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`)
  if (!searchRes.ok) throw new Error(`YouTube API error: ${searchRes.status}`)
  const searchData = await searchRes.json()

  const ids = searchData.items.map((item) => item.id.videoId).join(',')
  if (!ids) return []

  // Step 2: fetch full details for those IDs
  const detailParams = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: ids,
    key: getApiKey(),
  })

  const detailRes = await fetch(`${BASE_URL}/videos?${detailParams}`)
  if (!detailRes.ok) throw new Error(`YouTube API error: ${detailRes.status}`)
  const detailData = await detailRes.json()
  return detailData.items.map(formatVideo)
}

/**
 * Fetch a single video by ID (with full details)
 */
export async function fetchVideoById(videoId) {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: videoId,
    key: getApiKey(),
  })

  const res = await fetch(`${BASE_URL}/videos?${params}`)
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  const data = await res.json()
  if (!data.items?.length) return null
  return formatVideo(data.items[0])
}

/**
 * Fetch related videos for a given video ID.
 * Uses keyword search based on the video's title since
 * YouTube deprecated the relatedToVideoId parameter.
 */
export async function fetchRelatedVideos(videoId, maxResults = 15) {
  try {
    // First, get the current video's title to use as search keywords
    const video = await fetchVideoById(videoId)
    if (!video) throw new Error('Video not found')

    // Take first few meaningful words from the title as a search query
    const keywords = video.title
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .slice(0, 4)
      .join(' ')

    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: keywords,
      type: 'video',
      maxResults: String(maxResults + 1), // +1 to filter out the current video
      key: getApiKey(),
    })

    const searchRes = await fetch(`${BASE_URL}/search?${searchParams}`)
    if (!searchRes.ok) throw new Error()
    const searchData = await searchRes.json()

    const ids = searchData.items
      .filter((item) => item.id?.videoId && item.id.videoId !== videoId)
      .map((item) => item.id.videoId)
      .slice(0, maxResults)
      .join(',')
    if (!ids) throw new Error()

    const detailParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: ids,
      key: getApiKey(),
    })

    const detailRes = await fetch(`${BASE_URL}/videos?${detailParams}`)
    if (!detailRes.ok) throw new Error()
    const detailData = await detailRes.json()
    return detailData.items.map(formatVideo)
  } catch {
    // Fallback: just fetch popular videos instead
    return fetchPopularVideos(maxResults)
  }
}

/**
 * Fetch video categories
 */
export async function fetchCategories() {
  const params = new URLSearchParams({
    part: 'snippet',
    regionCode: 'IN',
    key: API_KEY,
  })

  const res = await fetch(`${BASE_URL}/videoCategories?${params}`)
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  const data = await res.json()
  return data.items
    .filter((cat) => cat.snippet.assignable)
    .map((cat) => ({
      id: cat.id,
      title: cat.snippet.title,
    }))
}

/* ── Helpers ──────────────────────────────────────────────────── */

function formatVideo(item) {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails?.duration || '',
    viewCount: item.statistics?.viewCount || '0',
    likeCount: item.statistics?.likeCount || '0',
    commentCount: item.statistics?.commentCount || '0',
  }
}

/**
 * Format ISO 8601 duration (PT1H2M3S) to human-readable (1:02:03)
 */
export function formatDuration(isoDuration) {
  if (!isoDuration) return ''
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * Format view count (1234567 → "1.2M views")
 */
export function formatViewCount(count) {
  const n = parseInt(count, 10)
  if (isNaN(n)) return '0 views'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`
  return `${n} views`
}

/**
 * Format relative time ("3 days ago", "2 months ago")
 */
export function formatTimeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'Just now'
}
