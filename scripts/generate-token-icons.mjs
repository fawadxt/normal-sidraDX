import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { SIDRA_TOKENS } from '../shared/tokens.ts'
import { BSC_TOKENS } from '../shared/bscTokens.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'tokens')

const PALETTE = [
  ['#1E4A7A', '#4A7FD4'],
  ['#0F766E', '#2DD4BF'],
  ['#7C2D12', '#F97316'],
  ['#4C1D95', '#A78BFA'],
  ['#831843', '#F472B6'],
  ['#134E4A', '#14B8A6'],
  ['#713F12', '#FBBF24'],
  ['#1E3A5F', '#60A5FA'],
  ['#365314', '#A3E635'],
  ['#581C87', '#C084FC'],
  ['#7F1D1D', '#F87171'],
  ['#164E63', '#22D3EE'],
  ['#422006', '#D97706'],
  ['#312E81', '#818CF8'],
  ['#14532D', '#4ADE80'],
]

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function tokenGradient(symbol) {
  const key = symbol.toUpperCase()
  return PALETTE[hashString(key) % PALETTE.length]
}

function tokenIconLabel(symbol) {
  const key = symbol.toUpperCase()
  return key.length <= 4 ? key : key.slice(0, 4)
}

function iconSvg(symbol) {
  const key = symbol.toUpperCase()
  const [c1, c2] = tokenGradient(key)
  const label = tokenIconLabel(key)
  const fontSize = label.length <= 2 ? 44 : label.length === 3 ? 34 : 28

  return `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#g)"/>
  <text x="64" y="74" text-anchor="middle" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>
</svg>`
}

const SKIP = new Set(['USDT', 'USDC', 'BNB', 'SDA', 'WSDA'])
const SIDRA_OFFICIAL_SYMBOLS = ['SDA', 'WSDA']
const BSC_OFFICIAL_SYMBOLS = ['BNB', 'USDT', 'USDC']
const sidraIconSource = join(root, 'resources', 'sidra-chain-icon.png')
const bscIconDir = join(root, 'resources', 'bsc-tokens')

async function writeOfficialIcons(symbols, sourceForSymbol) {
  const size = 128
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="64" cy="64" r="64" fill="#fff"/></svg>`,
  )

  for (const symbol of symbols) {
    const source = sourceForSymbol(symbol)
    await sharp(source)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toFile(join(outDir, `${symbol}.png`))
  }
}

async function writeSidraOfficialIcons() {
  await writeOfficialIcons(SIDRA_OFFICIAL_SYMBOLS, () => sidraIconSource)
}

async function writeBscOfficialIcons() {
  await writeOfficialIcons(
    BSC_OFFICIAL_SYMBOLS,
    (symbol) => join(bscIconDir, `${symbol}.png`),
  )
}

async function main() {
  await mkdir(outDir, { recursive: true })

  const symbols = new Set([
    ...SIDRA_TOKENS.map((t) => t.symbol.toUpperCase()),
    ...BSC_TOKENS.map((t) => t.symbol.toUpperCase()),
  ])

  await writeSidraOfficialIcons()
  await writeBscOfficialIcons()

  let count = SIDRA_OFFICIAL_SYMBOLS.length + BSC_OFFICIAL_SYMBOLS.length
  for (const symbol of symbols) {
    if (SKIP.has(symbol)) continue
    const svg = iconSvg(symbol)
    const out = join(outDir, `${symbol}.png`)
    await sharp(Buffer.from(svg)).png().toFile(out)
    count++
  }

  const manifest = [...symbols].sort()
  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(
    `Generated ${count} token icons in public/tokens/ (SDA/WSDA + BNB/USDT/USDC use official logos)`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
