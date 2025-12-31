import { NextRequest } from 'next/server'
import { nullpassClient } from '@/lib/nullpass-client'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface ApiAuthResult {
    success: boolean
    user?: {
        id: string
        premiumTierBoard: string
    }
    apiKey?: string
    apiKeyId?: string
    error?: string
}

export async function authenticateApiKey(request: NextRequest): Promise<ApiAuthResult> {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                success: false,
                error: 'Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>'
            }
        }


        const nullpassUser = await nullpassClient.getUserByUserId(authHeader.substring(7))

        if (!nullpassUser) {

            return {
                success: false,
                error: 'User not found in nullpass'
            }

        }

        const boardService = nullpassUser.serviceAccess?.find(s => s.service === 'BOARD')

        const mappedUser = {
            id: nullpassUser.id,
            premiumTierBoard: boardService?.tier || 'free',
        }

        return {
            success: true,
            user: mappedUser,
        }
    } catch (error) {
        console.error('API authentication error:', error)
        return {
            success: false,
            error: 'Authentication failed'
        }
    }
}

export async function checkRateLimit(apiKey: string, user: any): Promise<{ allowed: boolean; limit: number; remaining: number; resetTime: number }> {
    return checkRateLimitFallback(apiKey, user)
}

setInterval(() => {
    const now = Date.now()
    for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

function checkRateLimitFallback(apiKey: string, user: any): { allowed: boolean; limit: number; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowMs = 60 * 1000
    const limit = 100

    const key = `rate_limit:${apiKey}`
    const current = rateLimitStore.get(key)

    if (!current || now > current.resetTime) {
        const newData = { count: 1, resetTime: now + windowMs }
        rateLimitStore.set(key, newData)
        return {
            allowed: true,
            limit,
            remaining: limit - 1,
            resetTime: newData.resetTime
        }
    }

    if (current.count >= limit) {
        return {
            allowed: false,
            limit,
            remaining: 0,
            resetTime: current.resetTime
        }
    }

    current.count++
    rateLimitStore.set(key, current)

    return {
        allowed: true,
        limit,
        remaining: limit - current.count,
        resetTime: current.resetTime
    }
}