import { createContext, useState, useEffect, useContext } from 'react'

const ApiKeyContext = createContext()

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('yt_api_key') || '')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // If no key on mount, open modal
    if (!apiKey) {
      setIsModalOpen(true)
    }
  }, [apiKey])

  const saveApiKey = (key) => {
    if (key?.trim()) {
      localStorage.setItem('yt_api_key', key.trim())
      setApiKey(key.trim())
      setIsModalOpen(false)
      // Optional: reload to ensure all services pick it up if they aren't reactive yet
      window.location.reload() 
    }
  }

  const removeApiKey = () => {
    localStorage.removeItem('yt_api_key')
    setApiKey('')
    setIsModalOpen(true)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, saveApiKey, removeApiKey, isModalOpen, setIsModalOpen }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  return useContext(ApiKeyContext)
}
