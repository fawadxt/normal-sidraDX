import { Router } from 'express'
import { z } from 'zod'
import { createSwap, getSwapStats, listSwaps } from '../db.js'

export const swapsRouter = Router()

const createSwapSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  inputAmount: z.string().min(1),
  outputAmount: z.string().min(1),
  feeTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  swapTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  fromToken: z.string().optional(),
  toToken: z.string().optional(),
})

swapsRouter.get('/stats', (_req, res) => {
  res.json(getSwapStats())
})

swapsRouter.get('/', (req, res) => {
  const wallet = typeof req.query.wallet === 'string' ? req.query.wallet : undefined
  res.json(listSwaps(wallet))
})

swapsRouter.post('/', (req, res) => {
  const parsed = createSwapSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid swap payload', details: parsed.error.flatten() })
    return
  }

  const feeAmount = process.env.SWAP_FEE_AMOUNT ?? '0.1'
  const swap = createSwap({
    ...parsed.data,
    feeAmount,
  })

  res.status(201).json(swap)
})
