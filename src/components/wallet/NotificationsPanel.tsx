import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useWalletNotifications } from '../../context/WalletNotificationsContext'

function formatWhen(iso: string) {
  const date = new Date(iso)
  const now = Date.now()
  const diff = now - date.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function NotificationsPanel() {
  const { notifications, panelOpen, closePanel, clearAll } = useWalletNotifications()

  return (
    <AnimatePresence>
      {panelOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close notifications"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-[2px]"
            onClick={closePanel}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+3.75rem)] z-[56] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 overflow-hidden rounded-[24px] border border-[var(--premium-border)] bg-[var(--premium-surface-solid)] shadow-[var(--premium-shadow-md)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--premium-border)] px-4 py-3">
              <h2 className="text-sm font-semibold text-[var(--premium-text)]">Notifications</h2>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-[var(--premium-text-muted)]"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={closePanel}
                  className="text-[11px] font-semibold text-[#A67C00]"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[min(22rem,55dvh)] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-[var(--premium-text-muted)]">
                  No notifications yet. Transaction alerts will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--premium-border)]">
                  {notifications.map((item) => (
                    <li key={item.id} className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            item.type === 'swap'
                              ? 'bg-[#FFF9E6] text-[#A67C00]'
                              : item.type === 'received'
                                ? 'bg-[#F0FFF4] text-[#3D9A6A]'
                                : 'bg-[#FFF5F5] text-[#C45C5C]'
                          }`}
                        >
                          {item.type === 'swap' ? '⇄' : item.type === 'received' ? '↓' : '↑'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--premium-text)]">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-[var(--premium-text-muted)]">
                            {item.body}
                          </p>
                          <p className="mt-1 text-[10px] text-[var(--premium-text-muted)] opacity-80">
                            {formatWhen(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-[var(--premium-border)] px-4 py-3">
              <Link
                to="/history"
                onClick={closePanel}
                className="block text-center text-xs font-semibold text-[#A67C00]"
              >
                View all activity
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
