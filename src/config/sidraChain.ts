import { defineChain } from 'viem'

export const sidraChain = defineChain({
  id: 97453,
  name: 'Sidra Chain',
  nativeCurrency: {
    name: 'Sidra Coin',
    symbol: 'SDA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://node.sidrachain.com'] },
    public: { http: ['https://node.sidrachain.com'] },
  },
  blockExplorers: {
    default: { name: 'SidraScan', url: 'https://ledger.sidrachain.com' },
  },
})
