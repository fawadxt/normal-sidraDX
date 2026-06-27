import { Router } from 'express'
import { quoteSwap } from '../onchain/client.js'

export const quoteRouter = Router()

quoteRouter.get('/', async (req, res) => {
  const from = String(req.query.from ?? '')
  const to = String(req.query.to ?? '')
  const amountIn = String(req.query.amountIn ?? '')

  if (!from || !to || !amountIn || Number(amountIn) <= 0) {
    res.status(400).json({ error: 'from, to, and amountIn are required' })
    return
  }

  const routerAddress = process.env.SWAP_ROUTER_ADDRESS?.trim() || null
  const slippageBps = Number(req.query.slippageBps ?? process.env.SWAP_SLIPPAGE_BPS ?? 100)

  try {
    const quote = await quoteSwap(from, to, amountIn, routerAddress, slippageBps)
    res.json(quote)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Quote failed'
    res.status(400).json({ error: message })
  }
})
