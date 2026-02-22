import { ChatMessage } from '@prisma/client'

export interface ChatMessagePayload {
    roomId: string
    userId?: string
    userName: string
    color: string
    content: string
    emoji: string | null
    reaction: reactionPayload | null
    media: mediaPayload | null
    // either owner, guest or anynomus, we're not sending it now (host, member, ano)
    rank: string
    // stuff like badges, leaves space for embeds, voice messages etc
    metadata: []
}

export interface reactionPayload {
    character: string
    amount: number
    userId: string
}
 
export interface mediaPayload {
    type: 'image' | 'video' | 'audio'
    url: string
    height?: number
    width?: number
    duration?: number
}

export interface ReportPayload {
    roomId: string
    messageId?: string
    messageContent: string
    reason: string
    reporterId?: string
    reporterName: string
    reportedUserId?: string
    reportedUserName: string
}

export async function fetchSessionChat(roomId: string): Promise<ChatMessage[]> {
    try {
        const response = await fetch(`/api/chat?roomId=${roomId}`)

        if (!response.ok) {
            throw new Error('Failed to fetch chat history')
        }

        const data = await response.json()

        return data.messages || []

    } catch (error) {
        console.error('Error fetching session chat:', error)
        return []
    }
}

export async function saveSessionChatMessage(payload: ChatMessagePayload): Promise<ChatMessage | null> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {

            const errorData = await response.json()
            console.warn('Chat message not saved to database (might not be a premium session):', errorData.error)
            return null
        }

        const data = await response.json()
        return data.message

    } catch (error) {
        console.error('Error saving chat message:', error)
        return null
    }
}

export async function reportChatMessage(payload: ReportPayload): Promise<boolean> {
    try {
        const response = await fetch('/api/chat/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.warn('Failed to report chat message:', await response.text())
            return false
        }

        return true
    } catch (error) {
        console.error('Error reporting chat message:', error)
        return false
    }
}