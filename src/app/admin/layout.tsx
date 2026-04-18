import { AdminFeedbackProvider } from '@/components/admin/AdminFeedbackProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { SettingsProvider } from '@/context/SettingsContext'
import { client } from '@/sanity/lib/client'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const [config, appearance, contact] = await Promise.all([
        client.fetch(`*[_type == "siteConfig"][0]`, {}, { cache: 'no-store' }),
        client.fetch(`*[_id == "appearance-settings"][0]{
            brandName,
            logo,
            favicon,
            logoWidth,
            splitText,
            isJoined,
            accessibilityScale,
            primaryColor,
            minDepositPercent,
            minIncome,
            minWorkExperience,
            hero {
                title,
                subtitle,
                image,
                position
            }
        }`, {}, { cache: 'no-store' }),
        client.fetch(
            `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`,
            {},
            { cache: 'no-store' }
        ),
    ])

    const configCompleta = { ...(config || {}), ...(contact || {}) }

    return (
        <SettingsProvider config={configCompleta} appearance={appearance || {}}>
            <AuthProvider>
                <AdminFeedbackProvider>
                    {children}
                </AdminFeedbackProvider>
            </AuthProvider>
        </SettingsProvider>
    )
}
