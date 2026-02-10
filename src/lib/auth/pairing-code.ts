import { randomBytes } from 'crypto'

// Ambiguous chars removed: O/0/I/1/L
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generatePairingCode(): string {
  const bytes = randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return code
}
