  import { useState, useEffect, useCallback } from 'react'
  import { fetchPopularVideos, searchVideos, fetchCategories } from '../services/youtube'
  import { useHistory } from '../context/HistoryContext'
  import VideoCard from '../components/VideoCard'

  function SkeletonCard() {
    return (
      <div className="animate-pulse">
        <div className="aspect-video bg-gray-300 dark:bg-[#303030] rounded-xl" />
        <div className="flex gap-3 mt-3">
          <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-[#303030] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-[#303030] rounded w-full" />
            <div className="h-4 bg-gray-300 dark:bg-[#303030] rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-[#303030] rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  const FILTER_LABELS = {
    home: null,
    shorts: 'YouTube Shorts',
    trending: 'Trending',
    music: 'Music',
  }

  export default function Home({ searchQuery, sidebarFilter = 'home' }) {
    const [videos, setVideos] = useState([])
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState('0')
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [nextPageToken, setNextPageToken] = useState('')
    const [error, setError] = useState(null)
    
    const { getRecommendationQuery } = useHistory()
    const [recommended, setRecommended] = useState([])

    useEffect(() => {
      fetchCategories()
        .then(setCategories)
        .catch(() => {})
    }, [])

    const loadVideos = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
        let result
        if (searchQuery?.trim()) {
          result = await searchVideos(searchQuery)
        } else if (sidebarFilter === 'shorts') {
          result = await searchVideos('#shorts', 20)
        } else if (sidebarFilter === 'music') {
          result = await fetchPopularVideos(20, '10')
        } else if (sidebarFilter === 'trending') {
          result = await fetchPopularVideos(20, '0')
        } else {
          result = await fetchPopularVideos(20, activeCategory)
        }
        

        if (result.items) {
          setVideos(result.items)
          setNextPageToken(result.nextPageToken || '')
        } else {
          setVideos([])
          setNextPageToken('')
        }

        if (sidebarFilter === 'home' && !searchQuery?.trim()) {
          try {
            const query = getRecommendationQuery()
            if (query) {
              const recs = await searchVideos(query, 8)
              setRecommended(recs.items || [])
            }
          } catch(e) { console.error(e) }
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err)
        setError(err.message || 'Failed to load videos')
      } finally {
        setLoading(false)
      }
    }, [searchQuery, sidebarFilter, activeCategory])

    useEffect(() => {
      loadVideos()
    }, [loadVideos])


    const loadMore = async () => {
      setLoadingMore(true)
      try {
        let more
        if (searchQuery?.trim()) {
          more = await searchVideos(searchQuery, 10, nextPageToken)
        } else if (sidebarFilter === 'shorts') {
          more = await searchVideos('#shorts', 10, nextPageToken)
        } else if (sidebarFilter === 'music') {
          more = await fetchPopularVideos(10, '10', nextPageToken)
        } else if (sidebarFilter === 'trending') {
          more = await fetchPopularVideos(10, '0', nextPageToken)
        } else {
          more = await fetchPopularVideos(10, activeCategory, nextPageToken)
        }

        if (more.items) {
          const existingIds = new Set(videos.map((v) => v.id))
          const newVideos = more.items.filter((v) => !existingIds.has(v.id))
          setVideos((prev) => [...prev, ...newVideos])
          setNextPageToken(more.nextPageToken || '')
        }
      } catch (err) {
        console.error('Failed to load more:', err)
      } finally {
        setLoadingMore(false)
      }
    }

    const showChips = sidebarFilter === 'home' && !searchQuery?.trim()

    return (
      <div className="p-4 md:p-6">
        {FILTER_LABELS[sidebarFilter] && !searchQuery?.trim() && (
          <h2 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
            {FILTER_LABELS[sidebarFilter]}
          </h2>
        )}

        {showChips && (
          <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('0')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === '0'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3a3a]'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {searchQuery?.trim() && !loading && (
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Search results for &ldquo;{searchQuery}&rdquo;
          </h2>
        )}

        {sidebarFilter === 'home' && !searchQuery?.trim() && recommended.length > 0 && !loading && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-red-600">★</span> Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            <div className="h-px bg-gray-200 dark:bg-[#303030] mt-8" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadVideos}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {videos.length > 0 && (
              <div className="flex justify-center mt-10 mb-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-gray-100 dark:bg-[#272727] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] rounded-full text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">No videos found</p>
          </div>
        )}
      </div>
    )
  }
