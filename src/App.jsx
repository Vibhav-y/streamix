import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Watch from './pages/Watch'
import { ApiKeyProvider } from './context/ApiKeyContext'
import { HistoryProvider } from './context/HistoryContext'
import ApiKeyModal from './components/ApiKeyModal'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarFilter, setSidebarFilter] = useState('home') // 'home' | 'shorts' | 'trending' | 'music'

  // Dark mode state — persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('streamix-dark-mode')
    if (saved !== null) return JSON.parse(saved)
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('streamix-dark-mode', JSON.stringify(darkMode))
  }, [darkMode])

  const handleSidebarNavigate = (filter) => {
    setSidebarFilter(filter)
    setSearchQuery('')  // clear any active search when switching sidebar
  }

  return (
    <ApiKeyProvider>
      <HistoryProvider>
        <div className="min-h-screen bg-white dark:bg-[#0f0f0f] text-gray-900 dark:text-white">
          <ApiKeyModal />
          <Navbar
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            onSearch={(q) => {
              setSearchQuery(q)
              setSidebarFilter('home') // reset sidebar when searching
            }}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          />
          <Sidebar
            isOpen={sidebarOpen}
            activeFilter={sidebarFilter}
            onNavigate={handleSidebarNavigate}
          />

          <main className={`pt-14 transition-all duration-200 ${
            sidebarOpen ? 'ml-[240px]' : 'ml-[72px]'
          }`}>
            <Routes>
              <Route path="/" element={<Home searchQuery={searchQuery} sidebarFilter={sidebarFilter} />} />
              <Route path="/watch" element={<Watch />} />
            </Routes>
          </main>
        </div>
      </HistoryProvider>
    </ApiKeyProvider>
  )
}

export default App
