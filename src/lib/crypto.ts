const COLLAB_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-collab-key'
const COLLAB_SALT = 'nulldrop-collab-v1'
const LEGACY_SALT = 'nulldrop-salt'

/**
 * Derive encryption key from password using PBKDF2
 */
async function deriveKey(password: string, salt: string | Uint8Array = COLLAB_SALT): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  const saltBuffer = typeof salt === 'string' ? encoder.encode(salt) : salt

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt data for collaboration transport
 * Uses AES-GCM with random IV per encryption
 */
export async function encryptData(data: any): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const key = await deriveKey(COLLAB_KEY)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(JSON.stringify(data))
    )

    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt collaboration data
 * Supports both new and legacy salt formats
 */
export async function decryptData(encryptedData: string): Promise<any> {
  try {
    const decoder = new TextDecoder()
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))

    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    try {
      const key = await deriveKey(COLLAB_KEY, COLLAB_SALT)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      )
      return JSON.parse(decoder.decode(decrypted))
    } catch {
      const legacyKey = await deriveKey(COLLAB_KEY, LEGACY_SALT)
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        legacyKey,
        encrypted
      )
      return JSON.parse(decoder.decode(decrypted))
    }
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
  }

  const response = await fetch(url, fetchOptions)

  const isEncrypted = response.headers.get('X-Encrypted') === 'true'

  if (isEncrypted) {

    const data = await response.json()

    if (data.encrypted) {

      try {
        const decrypted = await decryptServerResponse(data.encrypted)
        return {
          ok: response.ok,
          status: response.status,
          json: async () => decrypted
        }
      } catch {

        return {
          ok: response.ok,
          status: response.status,
          json: async () => data
        }
      }
    }
  }

  return response
}

/**
 * Decrypt server-encrypted response
 * Server uses different encryption (Node.js crypto) so we need compatible decryption
 */
async function decryptServerResponse(encryptedData: string): Promise<any> {

  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
  const decoder = new TextDecoder()
  const SALT_LEN = 16
  const IV_LEN = 12
  const TAG_LEN = 16

  if (combined.length >= SALT_LEN + IV_LEN + TAG_LEN + 1) {
    try {
      const salt = combined.slice(0, SALT_LEN)
      const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN)
      const encryptedWithTag = combined.slice(SALT_LEN + IV_LEN)
      const key = await deriveKey(COLLAB_KEY, salt)

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedWithTag
      )

      return JSON.parse(decoder.decode(decrypted))
    } catch {
    }
  }

  const iv = combined.slice(0, IV_LEN)
  const encryptedWithTag = combined.slice(IV_LEN)

  const key = await deriveKey(COLLAB_KEY, LEGACY_SALT)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedWithTag
  )

  return JSON.parse(decoder.decode(decrypted))
}

/**
 * Server-side decryption for encrypted requests
 * Use this in API routes (but note this file is for client-side use)
 * 
 * @deprecated Use decryptRequest from api-crypto.ts on server instead
 */
export async function decryptRequest(body: any): Promise<any> {
  if (body && body.encrypted && typeof body.encrypted === 'string') {
    return await decryptData(body.encrypted)
  }
  return body
}