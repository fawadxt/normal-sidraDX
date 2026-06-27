import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFile, unlink } from 'fs/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pngSource = join(root, 'resources', 'app-icon-source.png')
const source = join(root, 'resources', 'icon.png')
const publicIcon = join(root, 'public', 'app-icon.png')
const publicPwaIcon = join(root, 'public', 'pwa-icon.png')
const resRoot = join(root, 'android', 'app', 'src', 'main', 'res')

const mipmaps = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
}

const splashPort = {
  'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [1080, 1920],
  'drawable-port-xxxhdpi': [1440, 2560],
}

const splashLand = {
  'drawable-land-mdpi': [480, 320],
  'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1920, 1080],
  'drawable-land-xxxhdpi': [2560, 1440],
}

const iconBg = { r: 12, g: 16, b: 22, alpha: 1 }
const splashBg = { r: 12, g: 16, b: 22, alpha: 1 }

async function prepareMasterIcon() {
  const buf = await sharp(pngSource)
    .resize(1024, 1024, { fit: 'contain', background: iconBg })
    .png()
    .toBuffer()

  await sharp(buf).toFile(source)
  await copyFile(source, publicIcon)
  await copyFile(source, publicPwaIcon)
  return buf
}

async function launcherIcon(size) {
  return sharp(source).resize(size, size, { fit: 'cover' }).png().toBuffer()
}

async function launcherForeground(size) {
  const inset = Math.round(size * 0.08)
  const inner = size - inset * 2
  const logo = await sharp(source).resize(inner, inner, { fit: 'contain' }).png().toBuffer()
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function writeLauncherIcons() {
  for (const [folder, size] of Object.entries(mipmaps)) {
    const dir = join(resRoot, folder)
    const full = await launcherIcon(size)
    const foreground = await launcherForeground(size)
    await sharp(full).toFile(join(dir, 'ic_launcher.png'))
    await sharp(full).toFile(join(dir, 'ic_launcher_round.png'))
    await sharp(foreground).toFile(join(dir, 'ic_launcher_foreground.png'))
  }
}

async function writeSplash([folder, [w, h]]) {
  const logoSize = Math.round(Math.min(w, h) * 0.42)
  const logo = await sharp(source).resize(logoSize, logoSize, { fit: 'contain' }).png().toBuffer()
  const out = join(resRoot, folder, 'splash.png')
  await sharp({
    create: { width: w, height: h, channels: 4, background: splashBg },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out)
}

async function writeDefaultSplash() {
  const logo = await sharp(source).resize(360, 360, { fit: 'contain' }).png().toBuffer()
  await sharp({
    create: { width: 1080, height: 1920, channels: 4, background: splashBg },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(join(resRoot, 'drawable', 'splash.png'))
}

async function removeLegacyIcons() {
  const legacy = [
    join(root, 'resources', 'brand-icon.svg'),
    join(root, 'public', 'brand-icon.svg'),
    join(root, 'public', 'pwa-icon.svg'),
  ]
  for (const file of legacy) {
    try {
      await unlink(file)
    } catch {
      // already removed
    }
  }
}

await prepareMasterIcon()
await removeLegacyIcons()
await writeLauncherIcons()
await writeDefaultSplash()
for (const entry of Object.entries(splashPort)) await writeSplash(entry)
for (const entry of Object.entries(splashLand)) await writeSplash(entry)

console.log('SidraWallet icons updated from app-icon-source.png (legacy icons removed).')
