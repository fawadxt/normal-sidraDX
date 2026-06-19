import { useEffect, useState } from 'react'
import { fetchQuote, type SwapQuote } from '../lib/api'

export function useSwapQuote(from: string, to: string, amountIn: string) {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!amountIn || Number(amountIn) <= 0 || from === to) {
      setQuote(null)
      setError(null)
      return
    }

    let cancelled = false
    const timer = setTimeout(() => {
      setIsLoading(true)
      setError(null)

      fetchQuote(from, to, amountIn)
        .then((data) => {
          if (!cancelled) setQuote(data)
        })
        .catch((err) => {
          if (!cancelled) {
            setQuote(null)
            setError(err instanceof Error ? err.message : 'Quote failed')
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [from, to, amountIn])

  return { quote, isLoading, error }
}
