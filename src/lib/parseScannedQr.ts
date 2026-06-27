import { validateRecipient } from './validateRecipient'

export function parseScannedAddress(raw: string): ReturnType<typeof validateRecipient> {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Empty QR code' }

  const candidates = new Set<string>()

  candidates.add(trimmed)

  if (trimmed.toLowerCase().startsWith('ethereum:')) {
    const withoutScheme = trimmed.slice('ethereum:'.length)
    const addressPart = withoutScheme.split(/[?@]/)[0]?.trim()
    if (addressPart) candidates.add(addressPart)
  }

  const uriMatch = trimmed.match(/(?:ethereum:)?(0x[a-fA-F0-9]{40})/i)
  if (uriMatch?.[1]) candidates.add(uriMatch[1])

  const looseMatch = trimmed.match(/\b(0x[a-fA-F0-9]{40})\b/)
  if (looseMatch?.[1]) candidates.add(looseMatch[1])

  for (const candidate of candidates) {
    const result = validateRecipient(candidate)
    if (result.ok) return result
  }

  return validateRecipient(trimmed)
}
