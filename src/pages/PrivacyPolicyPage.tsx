import { BRAND } from '../config/brand'
import { InfoDocLayout } from '../components/wallet/InfoDocLayout'

export function PrivacyPolicyPage() {
  return (
    <InfoDocLayout
      title="Privacy Policy"
      intro={`Effective: ${BRAND.privacyEffectiveYear}. At ${BRAND.name}, protecting user privacy is one of our priorities. We believe digital products should be secure, transparent and simple to use.`}
      sections={[
        {
          title: 'Information We Collect',
          body: `${BRAND.name} may process limited information required to operate the application, improve performance and maintain security.`,
        },
        {
          title: 'How We Use Information',
          bullets: [
            'To provide and maintain app functionality',
            'To improve user experience and performance',
            'To protect accounts and prevent misuse',
            'To respond to support requests',
          ],
        },
        {
          title: 'Data Protection',
          body: 'We apply reasonable technical and organizational measures to safeguard information and maintain service reliability.',
        },
        {
          title: 'Data Sharing',
          body: `${BRAND.name} does not sell personal information. Data may only be processed where necessary to operate services or comply with applicable requirements.`,
        },
        {
          title: 'User Control',
          body: 'Users remain responsible for managing their own account activity and may contact support regarding privacy-related questions.',
        },
        {
          title: 'Policy Updates',
          body: 'This Privacy Policy may be updated periodically. Continued use of the application means acceptance of the latest version.',
        },
      ]}
      footer={
        <>
          <p className="font-medium text-[var(--premium-text)]">{BRAND.name} Support</p>
          <p className="mt-1">Developer: {BRAND.developer}</p>
          <p className="mt-1">{BRAND.supportEmail}</p>
        </>
      }
    />
  )
}
