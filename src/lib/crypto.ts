const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || ''

/**
 * Derive encryption key from password
 */
async function deriveKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('nulldrop-salt'),
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
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: any): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const key = await deriveKey(ENCRYPTION_KEY)
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
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: string): Promise<any> {
  try {
    const decoder = new TextDecoder()
    const key = await deriveKey(ENCRYPTION_KEY)
    
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
    
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    return JSON.parse(decoder.decode(decrypted))
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Secure fetch wrapper that automatically decrypts responses
 * Always includes credentials to ensure cookies (auth tokens) are sent
 */
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
      const decrypted = await decryptData(data.encrypted)
      return {
        ok: response.ok,
        status: response.status,
        json: async () => decrypted
      }
    }
  }
  
  return response
}

/**
 * Server-side decryption for encrypted requests
 * Use this in API routes
 */
export async function decryptRequest(body: any): Promise<any> {
  if (body && body.encrypted && typeof body.encrypted === 'string') {
    return await decryptData(body.encrypted)
  }
  return body
}