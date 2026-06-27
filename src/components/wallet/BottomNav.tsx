import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ExploreNavIcon, SettingsNavIcon, SwapIcon, WalletNavIcon } from './WalletIcons'

const iconClass = 'h-full w-full'

const tabs: { to: string; label: string; icon: ReactNode; end?: boolean }[] = [
  { to: '/', label: 'Wallet', icon: <WalletNavIcon className={iconClass} />, end: true },
  { to: '/explore', label: 'Explore', icon: <ExploreNavIcon className={iconClass} /> },
  { to: '/swap', label: 'Swap', icon: <SwapIcon className={iconClass} /> },
  { to: '/settings', label: 'Settings', icon: <SettingsNavIcon className={iconClass} /> },
]

export function BottomNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="wallet-bottom-nav"
      aria-label="Main navigation"
    >
      <div className="wallet-bottom-nav__bar">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `wallet-bottom-nav__item ${isActive ? 'text-[var(--premium-gold)]' : 'text-white/45'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="wallet-nav-pill"
                    className="wallet-bottom-nav__pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="wallet-bottom-nav__icon">{tab.icon}</span>
                <span
                  className={`wallet-bottom-nav__label ${isActive ? 'text-white' : ''}`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  )
}
