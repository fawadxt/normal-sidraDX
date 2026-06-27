import { useCallback, useEffect, useState } from 'react'
import { fetchQuote, type SwapQuote } from '../lib/api'

const QUOTE_REFRESH_MS = 20_000

export function useSwapQuote(
  from: string,
  to: string,
  amountIn: string,
  slippageBps?: number,
) {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)

  const loadQuote = useCallback(
    async (signal?: AbortSignal) => {
      if (!amountIn || Number(amountIn) <= 0 || from === to) {
        setQuote(null)
        setError(null)
        setIsLoading(false)
        setUpdatedAt(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchQuote(from, to, amountIn, slippageBps)
        if (signal?.aborted) return
        setQuote(data)
        setUpdatedAt(Date.now())
      } catch (err) {
        if (signal?.aborted) return
        setQuote(null)
        setError(err instanceof Error ? err.message : 'Quote failed')
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [amountIn, from, slippageBps, to],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadQuote(controller.signal)
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [loadQuote])

  useEffect(() => {
    if (!amountIn || Number(amountIn) <= 0 || from === to) return

    const interval = window.setInterval(() => {
      void loadQuote()
    }, QUOTE_REFRESH_MS)

    return () => window.clearInterval(interval)
  }, [amountIn, from, to, loadQuote])

  const refresh = useCallback(() => loadQuote(), [loadQuote])

  return { quote, isLoading, error, updatedAt, refresh }
}
