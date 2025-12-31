import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''
const ALGORITHM = 'aes-256-gcm'

/**
 * Derive encryption key from password
 */
function deriveKey(password: string): Buffer {
  return pbkdf2Sync(password, 'nulldrop-salt', 100000, 32, 'sha256')
}

/**
 * Decrypt data on server
 */
export function decryptData(encryptedData: string): any {
  try {
    const key = deriveKey(ENCRYPTION_KEY)
    
    const combined = Buffer.from(encryptedData, 'base64')
    
    const iv = combined.slice(0, 12)
    const encryptedWithTag = combined.slice(12)
    
    const encrypted = encryptedWithTag.slice(0, -16)
    const authTag = encryptedWithTag.slice(-16)

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
 * Encrypt data on server (for responses)
 */
export function encryptData(data: any): string {
  try {
    const key = deriveKey(ENCRYPTION_KEY)
    const iv = randomBytes(12)
    
    const cipher = createCipheriv(ALGORITHM, key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ])
    
    const authTag = cipher.getAuthTag()

    const combined = Buffer.concat([iv, encrypted, authTag])

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