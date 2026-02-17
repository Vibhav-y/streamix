import { useState, useEffect } from 'react'
import { useApiKey } from '../context/ApiKeyContext'

export default function ApiKeyModal() {
  const { apiKey, saveApiKey, isModalOpen } = useApiKey()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isModalOpen) {
      setInput(apiKey || '')
    }
  }, [isModalOpen, apiKey])

  if (!isModalOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) {
      setError('API Key is required')
      return
    }
    saveApiKey(input)
    setError('')
  }

  // If there's no API key, this modal is blocking (cannot close without key)
  const isBlocking = !apiKey

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#212121] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#303030]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#303030] bg-gray-50 dark:bg-[#1a1a1a]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            Youtube API Key
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
            Streamix requires your own YouTube Data API v3 key to function. 
            The key is saved locally in your browser.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Enter API Key
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-[#303030] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white font-mono text-sm"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
              >
                Save API Key
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <a 
               href="https://console.cloud.google.com/apis/credentials" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
             >
               Get an API Key here
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
               </svg>
             </a>
          </div>
        </div>
      </div>
    </div>
  )
}
