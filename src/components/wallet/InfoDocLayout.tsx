import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from './PageHeader'

type Section = {
  title: string
  body?: string
  bullets?: string[]
}

type Props = {
  title: string
  intro?: string
  sections?: Section[]
  footer?: ReactNode
}

export function InfoDocLayout({ title, intro, sections = [], footer }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="wallet-page-gutter pb-8">
      <PageHeader title={title} backTo="/settings" />

      <div className="mt-3 space-y-4">
        {intro ? (
          <p className="text-sm leading-relaxed text-[var(--premium-text-muted)]">{intro}</p>
        ) : null}

        {sections.map((section) => (
          <section
            key={section.title}
            className="wallet-surface rounded-[var(--premium-radius-lg)] px-4 py-4"
          >
            <h2 className="text-sm font-semibold text-[var(--premium-text)]">{section.title}</h2>
            {section.body ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--premium-text-muted)]">{section.body}</p>
            ) : null}
            {section.bullets?.length ? (
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--premium-text-muted)]">
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[var(--premium-gold)]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {footer ? (
          <div className="wallet-surface rounded-[var(--premium-radius-lg)] px-4 py-4 text-sm text-[var(--premium-text-muted)]">
            {footer}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
