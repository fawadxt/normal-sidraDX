import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SwapDatabase, SwapRecord } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.VERCEL ? '/tmp/sidradx' : join(__dirname, '..', 'data')
const dbPath = join(dataDir, 'swaps.json')

function ensureDb(): SwapDatabase {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  if (!existsSync(dbPath)) {
    const empty: SwapDatabase = { swaps: [] }
    writeFileSync(dbPath, JSON.stringify(empty, null, 2), 'utf-8')
    return empty
  }

  return JSON.parse(readFileSync(dbPath, 'utf-8')) as SwapDatabase
}

function saveDb(db: SwapDatabase) {
  writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}

export function listSwaps(walletAddress?: string): SwapRecord[] {
  const db = ensureDb()
  if (!walletAddress) return db.swaps

  const normalized = walletAddress.toLowerCase()
  return db.swaps.filter((swap) => swap.walletAddress.toLowerCase() === normalized)
}

export function createSwap(record: Omit<SwapRecord, 'id' | 'createdAt'>): SwapRecord {
  const db = ensureDb()
  const swap: SwapRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }

  db.swaps.unshift(swap)
  saveDb(db)
  return swap
}

export function getSwapStats() {
  const db = ensureDb()
  const totalSwaps = db.swaps.length
  const totalFeesCollected = db.swaps.reduce((sum, swap) => sum + Number(swap.feeAmount), 0)

  return {
    totalSwaps,
    totalFeesCollected: totalFeesCollected.toFixed(4),
  }
}
