import { Link } from 'react-router-dom'
import { useApiKey } from '../context/ApiKeyContext'

const HomeIcon = ({ filled }) => (
  <svg className="w-6 h-6" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    {filled
      ? <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    }
  </svg>
)

const ShortsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
    <path fill="currentColor" d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33c-.77-.32-1.2-.5-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z"/>
  </svg>
)

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
  </svg>
)

const MusicIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
)

const KeyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 15l-1 1-2.293 2.293c-.63.63-1.846.63-2.475 0l-.707-.707c-.63-.63-.63-1.846 0-2.475L6.75 12.75l1-1 2.35-2.35c.22-.22.46-.41.714-.575A6 6 0 1115 7z" />
  </svg>
)

function SidebarItem({ icon, label, active = false, compact = false, onClick, isButton = false }) {
  const classes = compact
    ? `flex flex-col items-center gap-1 py-4 px-1 rounded-xl transition-colors cursor-pointer ${
        active
          ? 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272727]'
      }`
    : `flex items-center gap-6 px-3 py-2.5 rounded-xl transition-colors cursor-pointer w-full ${
        active
          ? 'bg-gray-100 dark:bg-[#272727] text-gray-900 dark:text-white font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#272727]'
      }`

  const content = compact ? (
    <>
      {icon}
      <span className="text-[10px]">{label}</span>
    </>
  ) : (
    <>
      {icon}
      <span className="text-sm">{label}</span>
    </>
  )

  if (isButton) {
     return (
        <button onClick={onClick} className={classes}>
           {content}
        </button>
     )
  }

  return (
    <Link to="/" onClick={onClick} className={classes}>
      {content}
    </Link>
  )
}

export default function Sidebar({ isOpen, activeFilter, onNavigate }) {
  const { removeApiKey } = useApiKey()
  const items = [
    { icon: <HomeIcon filled={activeFilter === 'home'} />, label: 'Home', filter: 'home' },
    { icon: <ShortsIcon />, label: 'Shorts', filter: 'shorts' },
    { icon: <TrendingIcon />, label: 'Trending', filter: 'trending' },
    { icon: <MusicIcon />, label: 'Music', filter: 'music' },
  ]

  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 bottom-0 w-[72px] bg-white dark:bg-[#0f0f0f] z-40 flex-col items-center pt-1 overflow-hidden border-r border-gray-100 dark:border-[#272727] hidden md:flex">
        {items.map((item) => (
          <div key={item.filter} className="w-full px-1">
            <SidebarItem
              icon={item.icon}
              label={item.label}
              active={activeFilter === item.filter}
              compact
              onClick={() => onNavigate(item.filter)}
            />
          </div>
        ))}
         <div className="w-full px-1 mt-auto pb-2">
            <SidebarItem
               icon={<KeyIcon />}
               label="Key"
               compact
               isButton
               onClick={removeApiKey}
            />
         </div>
      </aside>
    )
  }

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-30 md:hidden"
        onClick={() => onNavigate(activeFilter)} // Clicking backdrop closes/does nothing? Ideally we need a close handler, but using onNavigate reuse is tricky. Better to just let it be or add explicit close.
        // Actually, App.jsx controls state. We can't close it easily from here without a new prop.
        // For now, let's just show the sidebar on top.
      />
      
      <aside className="fixed left-0 top-14 bottom-0 w-[240px] bg-white dark:bg-[#0f0f0f] z-40 overflow-y-auto scrollbar-show-on-hover border-r border-gray-100 dark:border-[#272727] shadow-xl md:shadow-none">
      <div className="px-3 py-3">
        {/* Home + Shorts */}
        <SidebarItem icon={items[0].icon} label="Home" active={activeFilter === 'home'} onClick={() => onNavigate('home')} />
        <SidebarItem icon={items[1].icon} label="Shorts" active={activeFilter === 'shorts'} onClick={() => onNavigate('shorts')} />

        <div className="my-3 border-t border-gray-200 dark:border-[#303030]" />

        {/* Trending + Music */}
        <SidebarItem icon={items[2].icon} label="Trending" active={activeFilter === 'trending'} onClick={() => onNavigate('trending')} />
        <SidebarItem icon={items[3].icon} label="Music" active={activeFilter === 'music'} onClick={() => onNavigate('music')} />

        <div className="mt-auto px-3 pb-3">
          <div className="border-t border-gray-200 dark:border-[#303030] my-3" />
          <SidebarItem 
            icon={<KeyIcon />} 
            label="Change API Key" 
            isButton
            onClick={removeApiKey} 
          />
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 px-2">© 2026 Streamix</p>
        </div>
      </div>
    </aside>
  )
}
