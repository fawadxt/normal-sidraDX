import { motion } from 'framer-motion'
import { PageHeader } from '../components/wallet/PageHeader'
import { SwapSection } from '../components/wallet/SwapSection'

export function SwapPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="wallet-page-gutter pb-6"
    >
      <PageHeader title="Swap" backTo="/" />
      <SwapSection showTitle={false} className="mt-3" />
    </motion.div>
  )
}
