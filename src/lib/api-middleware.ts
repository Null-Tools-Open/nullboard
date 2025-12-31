import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'

export function withApiUsageLogging(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async (request: NextRequest, ...args: any[]) => {
        const startTime = Date.now()
        let auth: any = null
        let response: NextResponse

        try {
            auth = await authenticateApiKey(request)

            response = await handler(request, ...args)

            if (auth.success && auth.apiKeyId) {
                const responseTime = Date.now() - startTime

            }

            return response
        } catch (error) {
            console.error('API handler error:', error)

            if (auth?.success && auth.apiKeyId) {
                const responseTime = Date.now() - startTime

            }

            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            )
        }
    }
}

export function logApiUsageForAuth(auth: any, request: NextRequest, statusCode: number, startTime: number) {
    if (auth.success && auth.apiKeyId) {
        const responseTime = Date.now() - startTime

    }
}