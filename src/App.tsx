import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import Web3Dashboard from './components/Web3Dashboard'
import { wagmiConfig } from './config/wagmi'

const queryClient = new QueryClient()

export function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
