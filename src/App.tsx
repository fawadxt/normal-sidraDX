import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { MobileRouter } from './components/MobileRouter'
import { WalletLockProvider } from './context/WalletLockContext'
import { WalletLayout } from './layouts/WalletLayout'
import { wagmiConfig } from './config/wagmi'

const queryClient = new QueryClient()

const WalletHomePage = lazy(() =>
  import('./pages/WalletHomePage').then((m) => ({ default: m.WalletHomePage })),
)
const SwapPage = lazy(() => import('./pages/SwapPage').then((m) => ({ default: m.SwapPage })))
const SendPage = lazy(() => import('./pages/SendPage').then((m) => ({ default: m.SendPage })))
const ReceivePage = lazy(() =>
  import('./pages/ReceivePage').then((m) => ({ default: m.ReceivePage })),
)
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const ExplorePage = lazy(() =>
  import('./pages/ExplorePage').then((m) => ({ default: m.ExplorePage })),
)
const OnboardingPage = lazy(() =>
  import('./pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
)
const UnlockPage = lazy(() =>
  import('./pages/UnlockPage').then((m) => ({ default: m.UnlockPage })),
)
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
)
const AssetsActivityPage = lazy(() =>
  import('./pages/AssetsActivityPage').then((m) => ({ default: m.AssetsActivityPage })),
)
const SecuritySettingsPage = lazy(() =>
  import('./pages/SecuritySettingsPage').then((m) => ({ default: m.SecuritySettingsPage })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-safe">
      <div className="h-8 w-8 animate-pulse rounded-full bg-[#D4AF37]/30" />
    </div>
  )
}

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MobileRouter>
          <WalletLockProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="unlock" element={<UnlockPage />} />
                <Route element={<WalletLayout />}>
                  <Route index element={<WalletHomePage />} />
                  <Route path="swap" element={<SwapPage />} />
                  <Route path="send" element={<SendPage />} />
                  <Route path="receive" element={<ReceivePage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/about" element={<AboutPage />} />
                  <Route path="settings/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="settings/assets" element={<AssetsActivityPage />} />
                  <Route path="settings/security" element={<SecuritySettingsPage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </WalletLockProvider>
        </MobileRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
