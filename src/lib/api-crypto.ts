import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''
const ALGORITHM = 'aes-256-gcm'
const SALT_LENGTH = 16
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const LEGACY_SALT = 'nulldrop-salt'

/**
 * Derive encryption key from password with provided salt
 */
function deriveKey(password: string, salt: Buffer | string): Buffer {
  const saltBuffer = typeof salt === 'string' ? Buffer.from(salt, 'utf8') : salt
  return pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256')
}

/**
 * Generate a random salt for new encryption operations
 */
function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH)
}

function isNewFormat(combined: Buffer): boolean {
  return combined.length >= 45
}

/**
 * Decrypt data on server (supports both new and legacy formats)
 */
export function decryptData(encryptedData: string): any {
  try {
    const combined = Buffer.from(encryptedData, 'base64')

    if (isNewFormat(combined)) {
      try {
        const salt = combined.slice(0, SALT_LENGTH)
        const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
        const encryptedWithTag = combined.slice(SALT_LENGTH + IV_LENGTH)

        const encrypted = encryptedWithTag.slice(0, -AUTH_TAG_LENGTH)
        const authTag = encryptedWithTag.slice(-AUTH_TAG_LENGTH)

        const key = deriveKey(ENCRYPTION_KEY, salt)
        const decipher = createDecipheriv(ALGORITHM, key, iv)
        decipher.setAuthTag(authTag)

        const decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final()
        ])

        return JSON.parse(decrypted.toString('utf8'))
      } catch {
      }
    }

    const iv = combined.slice(0, IV_LENGTH)
    const encryptedWithTag = combined.slice(IV_LENGTH)

    const encrypted = encryptedWithTag.slice(0, -AUTH_TAG_LENGTH)
    const authTag = encryptedWithTag.slice(-AUTH_TAG_LENGTH)

    const key = deriveKey(ENCRYPTION_KEY, LEGACY_SALT)
    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return JSON.parse(decrypted.toString('utf8'))
  } catch (error) {
    console.error('Server decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Encrypt data on server (for responses) - uses new format with random salt
 */
export function encryptData(data: any): string {
  try {
    const salt = generateSalt()
    const key = deriveKey(ENCRYPTION_KEY, salt)
    const iv = randomBytes(IV_LENGTH)

    const cipher = createCipheriv(ALGORITHM, key, iv)

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ])

    const authTag = cipher.getAuthTag()

    const combined = Buffer.concat([salt, iv, encrypted, authTag])

    return combined.toString('base64')
  } catch (error) {
    console.error('Server encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Middleware to decrypt incoming requests
 */
export function decryptRequest(body: any): any {
  if (body && body.encrypted && typeof body.encrypted === 'string') {
    try {
      return decryptData(body.encrypted)
    } catch (error) {
      console.error('Failed to decrypt request:', error)
      return body
    }
  }
  return body
}

/**
 * Encrypt response data
 */
export function encryptResponse(data: any): { encrypted: string } {
  return {
    encrypted: encryptData(data)
  }
}