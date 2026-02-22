import { getCurrentUser } from '@/lib/auth'
import { cookies } from 'next/headers'
import { nullpassClient } from '@/lib/nullpassClient'
import JSZip from 'jszip'
import { sendDataExportEmail } from './emailClient'

export async function sendDataRequest() {
    const webhookUrl = process.env.DATA_REQ_WEBHOOK
    if (!webhookUrl) {
        throw new Error('DATA_REQ_WEBHOOK is not configured')
    }

    const user = await getCurrentUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
        throw new Error('No authentication token found')
    }

    let nullpassUserData: any = null
    let allServicesData: Record<string, any> = {}

    try {
        const me = await nullpassClient.getMe(token)
        nullpassUserData = me.user

        if (me.user.serviceAccess) {
            for (const service of me.user.serviceAccess) {
                allServicesData[service.service.toLowerCase()] = {
                    id: service.id,
                    userId: service.userId,
                    service: service.service,
                    tier: service.tier,
                    isPremium: service.isPremium,
                    connected: service.connected,
                    accessFlags: service.accessFlags,
                    metadata: service.metadata,
                    customStorageLimit: service.customStorageLimit,
                    customApiKeyLimit: service.customApiKeyLimit,
                    polarCustomerId: service.polarCustomerId,
                    polarSubscriptionId: service.polarSubscriptionId,
                    polarSubscriptionStatus: service.polarSubscriptionStatus,
                }
            }
        }
    } catch (error) {
        console.error('Failed to fetch Null Pass data:', error)
        allServicesData = { error: 'Failed to fetch service data' }
    }

    const nullpassAccountData = {
        id: nullpassUserData?.id || user.id,
        email: nullpassUserData?.email || user.email,
        displayName: nullpassUserData?.displayName || user.name,
        createdAt: nullpassUserData?.createdAt,
        updatedAt: nullpassUserData?.updatedAt,
        twoFactorEnabled: nullpassUserData?.twoFactorEnabled || user.twoFactorEnabled || false,
    }

    const nullboardData = {
        account: {
            id: user.id,
            email: user.email,
            name: user.name || null,
        },
        subscription: {
            isPremium: user.isPremium,
            isPremiumBoard: user.isPremiumBoard || false,
            premiumTier: user.premiumTierBoard || 'free',
        },
        security: {
            twoFactorEnabled: user.twoFactorEnabled || false,
        },
        preferences: {
            userAcceptedCookies: user.userAcceptedCookies ?? false,
            userHideProfileInfo: user.userHideProfileInfo ?? false,
            cloudSyncEnabled: user.cloudSyncEnabled ?? false,
            animTurnedOff: user.animTurnedOff ?? false,
            debugView: user.debView ?? false,
            debugViewAlways: user.debViewAlw ?? false,
            colabCursors: user.colabCursors ?? false,
        },
        roles: {
            isNullBoardTeam: user.isNullBoardTeam || false,
            nullBoardTeamRole: user.nullBoardTeamRole || 'none',
        },
    }

    let avatarBuffer: Buffer | null = null
    let avatarExtension = 'png'

    try {
        const avatarResponse = await nullpassClient.getAvatar(token)

        if (avatarResponse.ok) {
            const contentType = avatarResponse.headers.get('content-type')
            if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
                avatarExtension = 'jpg'
            } else if (contentType?.includes('png')) {
                avatarExtension = 'png'
            } else if (contentType?.includes('webp')) {
                avatarExtension = 'webp'
            }

            const arrayBuffer = await avatarResponse.arrayBuffer()
            avatarBuffer = Buffer.from(arrayBuffer)
        }
    } catch (error) {
        console.error('Failed to fetch avatar:', error)
    }

    const readmeContent = `# User Data Export

Generated: ${new Date().toISOString()}

## Structure

- \`nullpass/\` - Data from Null Pass platform
  - \`account.json\` - Account information
  - \`services.json\` - All services overview
  - \`services/\` - Individual service data
- \`nullboard/\` - NullBoard specific data
  - \`data.json\` - NullBoard preferences and settings
- \`avatar/\` - User avatar image

## User Information

- User ID: ${user.id}
- Email: ${user.email}
- Name: ${user.name || 'Not set'}
`

    const zip = new JSZip()

    zip.file('nullpass/account.json', JSON.stringify(nullpassAccountData, null, 2))
    zip.file('nullpass/services.json', JSON.stringify(allServicesData, null, 2))

    for (const [serviceName, serviceData] of Object.entries(allServicesData)) {
        if (serviceData && typeof serviceData === 'object' && !serviceData.error) {
            zip.file(`nullpass/services/${serviceName}.json`, JSON.stringify(serviceData, null, 2))
        }
    }

    zip.file('nullboard/data.json', JSON.stringify(nullboardData, null, 2))

    if (avatarBuffer) {
        zip.file(`avatar/avatar.${avatarExtension}`, avatarBuffer)
    }

    zip.file('README.md', readmeContent)

    const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
    })

    let emailSent = false
    try {
        await sendDataExportEmail(user.email, zipBuffer, user.name || undefined)
        emailSent = true
    } catch (emailError) {
        console.error('Failed to send data export email:', emailError)
    }

    const embed = {
        title: 'Data Request',
        description: `User **${user.name || 'Unknown User'}** requested their data, their email is: **${user.email}**\n\nEmail sent successfully: **${emailSent ? 'Yes' : 'No'}**`,
        color: 0x5865f2,
        footer: {
            text: `Requested at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Warsaw' })}`,
        },
    }

    const payloadJson = JSON.stringify({
        content: '',
        embeds: [embed],
    })

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: payloadJson,
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Webhook request failed: ${response.status} - ${errorText}`)
    }

    return { success: true }
}