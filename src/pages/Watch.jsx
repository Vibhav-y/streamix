import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import YouTube from 'react-youtube'
import { fetchVideoById, fetchRelatedVideos, formatViewCount, formatTimeAgo, formatDuration } from '../services/youtube'
import { useHistory } from '../context/HistoryContext'

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



/* ── Main Watch Page ───────────────────────────────────────────── */
export default function Watch() {
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('v')

  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)

  const [isEnded, setIsEnded] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const playerRef = useRef(null)
  
  const { addToHistory } = useHistory()

  useEffect(() => {
    if (!videoId) return

    setLoading(true)
    setDescExpanded(false)
    setDescExpanded(false)
    setIsEnded(false)
    setIsPaused(false)

    Promise.all([
      fetchVideoById(videoId),
      fetchRelatedVideos(videoId),
    ]).then(([v, r]) => {
      setVideo(v)
      setRelated(r)
      if (v) addToHistory(v)
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
      hl: 'en',
    },
  }

  const handleStateChange = (e) => {
    // YouTube Player State: 0 = ended, 2 = paused
    if (e.data === 0) {
      setIsEnded(true)
      setIsPaused(false)
    } else if (e.data === 2) {
      setIsPaused(true)
    } else {
      setIsEnded(false)
      setIsPaused(false)
    }
  }

  const handleResume = () => {
    setIsEnded(false)
    setIsPaused(false)
    playerRef.current?.playVideo()
  }

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">No video selected</p>
      </div>
    )
  }

  // ── Keyboard Controls ──────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e) {
      if (!playerRef.current) return
      
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return

      const player = playerRef.current
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault() // Prevent scrolling for space
          // 1 = playing
          if (player.getPlayerState() === 1) player.pauseVideo()
          else player.playVideo()
          break
          
        case 'arrowleft':
          e.preventDefault() // prevent scroll
          player.seekTo(player.getCurrentTime() - 5, true)
          break
          
        case 'arrowright':
          e.preventDefault() // prevent scroll
          player.seekTo(player.getCurrentTime() + 5, true)
          break
          
        case 'j':
          player.seekTo(player.getCurrentTime() - 10, true)
          break
          
        case 'l':
          player.seekTo(player.getCurrentTime() + 10, true)
          break
          
        case 'm':
          if (player.isMuted()) player.unMute()
          else player.mute()
          break
          
        case 'f':
          const iframe = player.getIframe()
          if (!document.fullscreenElement) {
            iframe.requestFullscreen().catch(err => console.error(err))
          } else {
            document.exitFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left column: Player + Info ───────────────────── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <PlayerSkeleton />
          ) : (
            <>
              {/* Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group">
                <YouTube
                  videoId={videoId}
                  opts={playerOpts}
                  className="w-full h-full"
                  iframeClassName="w-full h-full"
                  onStateChange={handleStateChange}
                  onReady={(e) => (playerRef.current = e.target)}
                />

                {/* ── Custom Overlay (Ended or Paused) ─────── */}
                {(isEnded || isPaused) && (
                  <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-sm">
                    <h3 className="text-white text-lg font-bold mb-6">
                      {isEnded ? 'Up Next' : 'Paused'}
                    </h3>
                    
                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                      {related.slice(0, 3).map((v) => (
                        <Link 
                          key={v.id} 
                          to={`/watch?v=${v.id}`}
                          className="w-48 group/card flex flex-col items-center"
                        >
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 ring-2 ring-transparent group-hover/card:ring-blue-500 transition-all">
                            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors" />
                            {/* Play icon overlay on hover */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="bg-black/50 rounded-full p-2">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <p className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover/card:text-blue-400 text-center">
                            {v.title}
                          </p>
                        </Link>
                      ))}
                    </div>

                    <button 
                      onClick={handleResume}
                      className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-lg transition-colors cursor-pointer shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      {isEnded ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Replay
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Resume
                        </>
                      )}
                    </button>
                  </div>
                )}
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
        <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0 space-y-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 lg:hidden">
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
