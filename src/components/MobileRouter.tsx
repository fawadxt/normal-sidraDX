import type { ReactNode } from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { isNativePlatform } from '../lib/platform'

type Props = {
  children: ReactNode
}

/** Browser history on web; hash routing in Capacitor WebView for reliable mobile navigation. */
export function MobileRouter({ children }: Props) {
  if (isNativePlatform()) {
    return <HashRouter>{children}</HashRouter>
  }
  return <BrowserRouter>{children}</BrowserRouter>
}
