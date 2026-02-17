import { createContext, useState, useEffect, useContext } from 'react'

const HistoryContext = createContext()

const MAX_HISTORY = 50

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('yt_history')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('yt_history', JSON.stringify(history))
  }, [history])

  const addToHistory = (video) => {
    if (!video || !video.id) return

    setHistory((prev) => {
      // Remove if already exists (to move to top)
      const filtered = prev.filter((v) => v.id !== video.id)
      
      // Add simplified video object to top
      const newEntry = {
        id: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        tags: video.tags || [],
        timestamp: Date.now(),
      }

      // Limit to MAX_HISTORY
      return [newEntry, ...filtered].slice(0, MAX_HISTORY)
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('yt_history')
  }

  /**
   * Generates a search query based on the most frequent tags and channels in history.
   * Returns null if no history.
   */
  const getRecommendationQuery = () => {
    if (history.length === 0) return null

    // Collect all tags and channel names
    const tagCounts = {}
    const channelCounts = {}

    history.forEach((video) => {
      // Weight recent videos slightly higher? Not implemented for simplicity, just raw count.
      
      // Count tags
      if (video.tags && Array.isArray(video.tags)) {
        video.tags.forEach((tag) => {
          const t = tag.toLowerCase()
          tagCounts[t] = (tagCounts[t] || 0) + 1
        })
      }

      // Count channels
      if (video.channelTitle) {
        const c = video.channelTitle
        channelCounts[c] = (channelCounts[c] || 0) + 1
      }
    })

    // Sort tags by frequency
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag)

    // Sort channels by frequency
    const topChannels = Object.entries(channelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([channel]) => channel)

    // Construct query: (tag1 | tag2 | channel1)
    const queryParts = [...topTags, ...topChannels]
    if (queryParts.length === 0) return null

    return queryParts.join('|')
  }

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, getRecommendationQuery }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  return useContext(HistoryContext)
}
