import { Link } from 'react-router-dom'
import { formatDuration, formatViewCount, formatTimeAgo } from '../services/youtube'

export default function VideoCard({ video }) {
  return (
    <Link
      to={`/watch?v=${video.id}`}
      className="group cursor-pointer block no-underline"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-[#272727] rounded-xl overflow-hidden">
        <img
          src={video.thumbnailHigh || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />

        {/* Duration badge */}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Hover progress bar preview */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700" />
      </div>

      {/* Info */}
      <div className="flex gap-3 mt-3">
        {/* Channel avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
          {video.channelTitle?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium leading-5 line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {video.title}
          </h3>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            {video.channelTitle}
          </p>
          <p className="text-[13px] text-gray-600 dark:text-gray-400">
            {formatViewCount(video.viewCount)} · {formatTimeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
    </Link>
  )
}
