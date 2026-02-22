import { Shield, Code, Crown, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface BoardBadgesProps {
    isTeam?: boolean
    role?: string | null
    className?: string
}

export function BoardBadges({ isTeam, role, className }: BoardBadgesProps) {

    if (!isTeam) return null

    const badges = []

    if (isTeam) {
        badges.push({
            id: 'team',
            icon: <Shield size={14} className="text-gray-500 dark:text-white/50" />,
            label: 'Team Member',
            bg: 'bg-gray-500/10 border-gray-500/20 dark:bg-white/10 dark:border-white/20'
        })
    }

    if (role && role !== 'member') {
        const roleLower = role.toLowerCase()

        if (roleLower === 'dev') {
            badges.push({
                id: 'dev',
                icon: <Code size={14} className="text-blue-500" />,
                label: 'Developer',
                bg: 'bg-blue-500/10 border-blue-500/20'
            })
        } else if (roleLower === 'founder') {
            badges.push({
                id: 'founder',
                icon: <Crown size={14} className="text-amber-500" />,
                label: 'Founder',
                bg: 'bg-amber-500/10 border-amber-500/20'
            })
        } else if (roleLower === 'manager') {
            badges.push({
                id: 'manager',
                icon: <Briefcase size={14} className="text-purple-500" />,
                label: 'Manager',
                bg: 'bg-purple-500/10 border-purple-500/20'
            })
        } else if (roleLower === 'moderator') {
            badges.push({
                id: 'moderator',
                icon: <Shield size={14} className="text-emerald-500" />,
                label: 'Moderator',
                bg: 'bg-emerald-500/10 border-emerald-500/20'
            })
        }
    }

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            {badges.map(badge => (
                <div key={badge.id} title={`Null Board ${badge.label}`} className={cn(
                    "w-[22px] h-[22px] flex items-center justify-center rounded-md border cursor-help",
                    badge.bg
                )}>
                    {badge.icon}
                </div>
            ))}
        </div>
    )
}