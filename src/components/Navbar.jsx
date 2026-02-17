import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

export default function Navbar({ onMenuToggle, onSearch, darkMode, onToggleDarkMode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (onSearch) onSearch(searchQuery)
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#303030]">

      {/* ── Left: Hamburger + Logo ─────────────────────── */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>

        <Link to="/" className="flex items-center gap-1 no-underline" onClick={() => onSearch && onSearch('')}>
          <div className="flex items-center">
            <div className="bg-red-600 rounded-lg p-1 flex items-center justify-center">
              <svg className="w-5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="ml-1 text-[20px] font-bold tracking-tight text-gray-900 dark:text-white">
              Streamix
            </span>
          </div>
        </Link>
      </div>

      {/* ── Center: Search bar ────────────────────────── */}
      <div className="flex items-center flex-1 max-w-[732px] mx-4">
        <div className={`flex flex-1 items-center border rounded-full overflow-hidden transition-all duration-200 ${
          searchFocused
            ? 'border-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]'
            : 'border-gray-300 dark:border-[#303030]'
        }`}>
          {searchFocused && (
            <div className="pl-4 pr-1 text-gray-400">
              <SearchIcon />
            </div>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search"
            className={`w-full py-2 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 text-base ${
              searchFocused ? 'pl-2' : 'pl-4'
            }`}
          />
        </div>

        <button
          onClick={handleSearch}
          className="flex items-center justify-center w-16 h-10 bg-gray-100 dark:bg-[#222222] border border-l-0 border-gray-300 dark:border-[#303030] rounded-r-full hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors cursor-pointer -ml-[1px]"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>

      {/* ── Right: Dark Mode toggle ──────────────────── */}
      <div className="flex items-center gap-1 min-w-[56px] justify-end">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  )
}
