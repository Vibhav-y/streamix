import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import { fetchVideoById, fetchRelatedVideos, formatViewCount, formatTimeAgo, formatDuration } from '../services/youtube'
import { triggerDownload, DOWNLOAD_OPTIONS } from '../services/download'

/* ── Skeleton for loading state ────────────────────────────────── */
function PlayerSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-300 dark:bg-[#303030] rounded-xl" />
      <div className="mt-4 space-y-3">
        <div className="h-6 bg-gray-300 dark:bg-[#303030] rounded w-3/4" />
        <div className="h-4 bg-gray-300 dark:bg-[#303030] rounded w-1/2" />
        <div className="h-4 bg-gray-300 dark:bg-[#303030] rounded w-1/3" />
      </div>
    </div>
  )
}

function RelatedSkeleton() {
  return (
    <div className="animate-pulse flex gap-2">
      <div className="w-40 aspect-video bg-gray-300 dark:bg-[#303030] rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-gray-300 dark:bg-[#303030] rounded w-full" />
        <div className="h-3 bg-gray-300 dark:bg-[#303030] rounded w-2/3" />
        <div className="h-3 bg-gray-300 dark:bg-[#303030] rounded w-1/2" />
      </div>
    </div>
  )
}

/* ── Related video card (horizontal layout) ────────────────────── */
function RelatedVideoCard({ video }) {
  return (
    <Link to={`/watch?v=${video.id}`} className="flex gap-2 group no-underline">
      <div className="relative w-40 aspect-video bg-gray-200 dark:bg-[#272727] rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {video.duration && (
          <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[11px] font-medium px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="flex-1 py-0.5 min-w-0">
        <h4 className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-5">
          {video.title}
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
          {video.channelTitle}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {formatViewCount(video.viewCount)} · {formatTimeAgo(video.publishedAt)}
        </p>
      </div>
    </Link>
  )
}

/* ── Download Button with Format Dropdown ──────────────────────── */
function DownloadButton({ videoId }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handlePick = (option) => {
    triggerDownload(videoId, option)
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-[#272727] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] transition-all cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#212121] rounded-xl shadow-xl border border-gray-200 dark:border-[#303030] overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-[#303030]">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Select Format
            </p>
          </div>

          {DOWNLOAD_OPTIONS.map((option, i) => (
            <button
              key={i}
              onClick={() => handlePick(option)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors cursor-pointer"
            >
              {option.format === 'mp3' ? (
                <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Watch Page ───────────────────────────────────────────── */
export default function Watch() {
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('v')

  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (!videoId) return

    setLoading(true)
    setDescExpanded(false)

    Promise.all([
      fetchVideoById(videoId),
      fetchRelatedVideos(videoId),
    ]).then(([v, r]) => {
      setVideo(v)
      setRelated(r)
    }).catch(console.error)
      .finally(() => setLoading(false))

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [videoId])

  const playerOpts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  }

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">No video selected</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto p-6">
      <div className="flex flex-col xl:flex-row gap-6">

        {/* ── Left column: Player + Info ───────────────────── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <PlayerSkeleton />
          ) : (
            <>
              {/* Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                <YouTube
                  videoId={videoId}
                  opts={playerOpts}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                />
              </div>

              {video && (
                <div className="mt-4">
                  {/* Title */}
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-7">
                    {video.title}
                  </h1>

                  {/* Channel row + Download */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {video.channelTitle?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {video.channelTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatViewCount(video.viewCount)} · {formatTimeAgo(video.publishedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Download button with format picker */}
                    <DownloadButton videoId={videoId} />
                  </div>

                  {/* Description */}
                  <div
                    className="mt-4 bg-gray-100 dark:bg-[#272727] rounded-xl p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors"
                    onClick={() => setDescExpanded((prev) => !prev)}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                      {formatViewCount(video.viewCount)} · {new Date(video.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className={`text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap ${
                      descExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {video.description || 'No description available.'}
                    </p>
                    <button className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 cursor-pointer">
                      {descExpanded ? 'Show less' : '...more'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right column: Related Videos ─────────────────── */}
        <div className="xl:w-[400px] flex-shrink-0 space-y-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 xl:hidden">
            Related Videos
          </h3>
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <RelatedSkeleton key={i} />)
            : related.map((v) => <RelatedVideoCard key={v.id} video={v} />)
          }
        </div>

      </div>
    </div>
  )
}
