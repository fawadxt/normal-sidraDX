import { motion } from 'framer-motion'
import { PageHeader } from '../components/wallet/PageHeader'

const exploreItems = [
  { title: 'SidraDEX', desc: 'Official Sidra swap pool' },
  { title: 'Staking', desc: 'Earn rewards on SDA — coming soon' },
  { title: 'Bridge', desc: 'Cross-chain transfers — coming soon' },
  { title: 'NFT Market', desc: 'Collectibles — coming soon' },
]

export function ExplorePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-6">
      <PageHeader title="Explore" backTo="/" />

      <div className="mx-5 mt-2 space-y-3">
        {exploreItems.map((item) => (
          <div
            key={item.title}
            className="rounded-[24px] bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          >
            <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
            <p className="mt-1 text-xs text-[#777777]">{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
