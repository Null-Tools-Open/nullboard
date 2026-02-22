import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Tailwind
} from '@react-email/components'

interface DataExportEmailProps {
    userName?: string
    userEmail: string
}

export const DataExportEmail = ({
    userName,
    userEmail,
}: DataExportEmailProps) => {
    const previewText = `Your Null Board data export is ready`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Your Data Export
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {userName || 'there'},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            As requested, we have attached a zip file containing a copy of your data from <strong>Null Board</strong> associated with the email <Link href={`mailto:${userEmail}`} className="text-blue-600 no-underline">{userEmail}</Link>.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            This archive includes your account information, service access details, preferences, and uploaded files (like your avatar).
                        </Text>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                Your data is attached as <strong>user-data.zip</strong>.
                                <br />Please download and extract it to view your files.
                            </Text>
                        </Section>

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            For security reasons, this email was sent to you because a data export was requested from your account. If you didn't request this, please change your password immediately or contact our support team.
                        </Text>

                        <Section className="mt-[32px]">
                            <Link href="https://github.com/Null-Tools-Open" className="text-[#666666] text-[12px] no-underline mr-[12px]">
                                GitHub
                            </Link>
                            <Link href="https://discord.gg/7WMZh7jjEB" className="text-[#666666] text-[12px] no-underline mr-[12px]">
                                Discord
                            </Link>
                            <Link href="https://x.com/NullToolsXYZ" className="text-[#666666] text-[12px] no-underline">
                                X (Twitter)
                            </Link>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}

DataExportEmail.PreviewProps = {
    userName: 'NullBoard',
    userEmail: 'support@nullboard.xyz',
} as DataExportEmailProps

export default DataExportEmail