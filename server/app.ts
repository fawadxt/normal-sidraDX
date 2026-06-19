import cors from 'cors'
import express from 'express'
import { configRouter } from './routes/config.js'
import { quoteRouter } from './routes/quote.js'
import { swapsRouter } from './routes/swaps.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sidradx-api' })
})

app.use('/api/config', configRouter)
app.use('/api/quote', quoteRouter)
app.use('/api/swaps', swapsRouter)

export default app
