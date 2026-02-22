import { Resend } from 'resend'
import { DataExportEmail } from '../emails/DataExportEmail'
import * as React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDataExportEmail(to: string, zipBuffer: Buffer, userName?: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [to],
            subject: 'Your Null Board Data Export',
            react: DataExportEmail({
                userEmail: to,
                userName: userName
            }) as React.ReactElement,
            attachments: [
                {
                    filename: 'user-data.zip',
                    content: zipBuffer,
                },
            ],
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(error.message)
        }

        return { success: true, data }
    } catch (error) {
        console.error('Failed to send email:', error)
        throw error
    }
}