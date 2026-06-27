import { BRAND } from '../config/brand'
import { InfoDocLayout } from '../components/wallet/InfoDocLayout'
import { ApkDownloadCard } from '../components/wallet/ApkDownloadCard'

export function AboutPage() {
  return (
    <InfoDocLayout
      title={`About ${BRAND.name}`}
      intro={`${BRAND.name} is a modern and secure digital wallet designed to provide a smooth and user-friendly experience. Our goal is to make digital wallet access simple, fast and reliable.`}
      sections={[
        {
          title: 'Features',
          bullets: [
            'Clean and modern interface',
            'Fast performance',
            'Secure experience',
            'Mobile optimized design',
          ],
        },
      ]}
      footer={
        <>
          <ApkDownloadCard />
          <p className="mt-6">
            <span className="font-medium text-[var(--premium-text)]">Version:</span> {BRAND.version}
          </p>
          <p className="mt-2">
            <span className="font-medium text-[var(--premium-text)]">Developed by:</span> {BRAND.developer}
          </p>
        </>
      }
    />
  )
}
