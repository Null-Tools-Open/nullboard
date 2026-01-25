import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { nullpassClient } from './nullpassClient'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const CACHE_TTL = 60 * 1000
const sessionCache = new Map<string, { data: User; userId: string; expires: number }>()
const userTokensMap = new Map<string, Set<string>>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of sessionCache.entries()) {
    if (value.expires < now) {
      sessionCache.delete(key)
      const tokens = userTokensMap.get(value.userId)
      if (tokens) {
        tokens.delete(key)
        if (tokens.size === 0) {
          userTokensMap.delete(value.userId)
        }
      }
    }
  }
}, 5 * 60 * 1000)

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string | null
  isPremium: boolean
  isPremiumBoard?: boolean
  premiumTierBoard?: string
  twoFactorEnabled?: boolean
  isNullBoardTeam?: boolean
  nullBoardTeamRole?: string
  polarCustomerId?: string
  polarSubscriptionId?: string
  polarSubscriptionStatus?: string
  userAcceptedCookies?: boolean
  userHideProfileInfo?: boolean
  cloudSyncEnabled?: boolean
  animTurnedOff?: boolean
  debView?: boolean
  debViewAlw?: boolean
  colabCursors?: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: object): string {
  const uniquePayload = {
    ...payload,
    jti: randomUUID(),
    iat: Math.floor(Date.now() / 1000),
  }
  return jwt.sign(uniquePayload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET as string)
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const cached = sessionCache.get(token)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }

    try {
      const response = await nullpassClient.getMe(token)
      const userData = nullpassClient.mapToNulldropUser(response.user)

      sessionCache.set(token, {
        data: userData,
        userId: userData.id,
        expires: Date.now() + CACHE_TTL
      })

      if (!userTokensMap.has(userData.id)) {
        userTokensMap.set(userData.id, new Set())
      }
      userTokensMap.get(userData.id)!.add(token)

      return userData
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        sessionCache.delete(token)
        return null
      }
      throw error
    }
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export function invalidateSessionCache(token: string): void {
  const cached = sessionCache.get(token)
  if (cached) {
    const tokens = userTokensMap.get(cached.userId)
    if (tokens) {
      tokens.delete(token)
      if (tokens.size === 0) {
        userTokensMap.delete(cached.userId)
      }
    }
  }
  sessionCache.delete(token)
}

export function invalidateUserSessions(userId: string): void {
  const tokens = userTokensMap.get(userId)
  if (tokens) {
    for (const token of tokens) {
      sessionCache.delete(token)
    }
    userTokensMap.delete(userId)
  }
}

export async function generateApiKey(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomString = Array.from({ length: 40 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('')

  return `nd_${randomString}`
}