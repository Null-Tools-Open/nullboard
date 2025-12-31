'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    User as UserIcon,
    LogOut,
    Shield,
    Key,
    EyeOff,
    Smartphone,
    Camera,
    Loader2,
    ArrowRight,
    Palette,
    Keyboard,
    Lock,
    Check,
    CreditCard,
    Box,
    Cloud,
    Layout,
    FolderOpen,
    Plus,
    Trash2,
    LogIn,
    Users,
    Bug,
    Form,
    ThumbsUp,
    Type,
    Brush
} from 'lucide-react'

import { useWorkspaces } from '@/hooks/useWorkspaces'
import { WorkspaceDeletePrompt } from './workspaceDelete'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { secureFetch } from '@/lib/crypto'
import { useDebugger } from '@/contexts/debuggerContext'

interface UserSettingsPromptProps {
    isOpen: boolean
    onClose: () => void
    elementCount?: number
}

export function UserSettingsPrompt({ isOpen, onClose, elementCount = 0 }: UserSettingsPromptProps) {
    const { user, logout, refreshUser } = useAuth()
    const { theme, setTheme, resolvedTheme, canvasColor, setCanvasColor } = useTheme()
    const [activeTab, setActiveTab] = useState('my-account')

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown, true)
        return () => document.removeEventListener('keydown', handleKeyDown, true)
    }, [isOpen, onClose])
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [displayName, setDisplayName] = useState(user?.name || '')
    const [isUploading, setIsUploading] = useState(false)
    const [privacyMode, setPrivacyMode] = useState(user?.userHideProfileInfo || false)
    const [showEmail, setShowEmail] = useState(false)
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(user?.cloudSyncEnabled || false)
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)
    const [newWorkspaceName, setNewWorkspaceName] = useState('')
    const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null)

    const [colabCursors, setColabCursors] = useState(true)
    const [colabGuestAccess, setColabGuestAccess] = useState(false)
    const [colabShowParticipants, setColabShowParticipants] = useState(true)
    const { debugView, setDebugView, debViewAlw, setDebViewAlw } = useDebugger()
    const [disableAnimations, setDisableAnimations] = useState(user?.animTurnedOff || false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        workspaces,
        activeWorkspaceId,
        createWorkspace,
        deleteWorkspace,
        switchWorkspace
    } = useWorkspaces()

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || '')
        }
    }, [user])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                e.stopPropagation()
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown, true)
        return () => document.removeEventListener('keydown', handleKeyDown, true)
    }, [isOpen, onClose])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('avatar', file)

        try {
            await secureFetch('/api/user/avatar', {
                method: 'POST',
                body: formData
            })
            await refreshUser()
        } catch (error) {
            console.error('Failed to upload avatar:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const startEditing = () => {
        setIsEditingProfile(true)
        setDisplayName(user?.name || '')
    }

    const saveProfile = async () => {
        try {
            await secureFetch('/api/user/profile', {
                method: 'PATCH',
                body: JSON.stringify({ name: displayName })
            })
            await refreshUser()
            setIsEditingProfile(false)
        } catch (err) {
            console.error('Failed to update profile', err)
        }
    }

    if (!user) return null


    const sidebarGroups = [
        {
            title: 'User Settings',
            items: [
                { id: 'my-account', label: 'My Account', icon: UserIcon },
                { id: 'privacy', label: 'Privacy & Safety', icon: Lock },
            ]
        },
        {
            title: 'App Settings',
            items: [
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'keybinds', label: 'Keybinds', icon: Keyboard },
            ]
        },
        {
            title: 'Workspaces',
            items: [
                { id: 'manage-workspaces', label: 'Workspaces', icon: FolderOpen },
                { id: 'collaboration', label: 'Collaboration', icon: Users },
                { id: 'whiteboard', label: 'Whiteboard', icon: Layout },
                { id: 'cloud-sync', label: 'Cloud Sync', icon: Cloud }
            ]
        },
        {
            title: 'Library',
            items: [
                { id: 'fonts', label: 'Fonts', icon: Type },
                { id: 'brushes', label: 'Brushes', icon: Brush },
                { id: 'templates', label: 'Templates', icon: Form },
                { id: 'icons', label: 'Icons', icon: ThumbsUp }
            ]
        },
        {
            title: 'License',
            items: [
                { id: 'billing', label: 'Billing', icon: CreditCard },
            ]
        }
    ]

    const getTabLabel = (id: string) => {
        for (const group of sidebarGroups) {
            const item = group.items.find(i => i.id === id)
            if (item) return item.label
        }
        return 'Settings'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-[100] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-8 overflow-hidden pointer-events-none"
                    >
                        <div className="bg-[#fcfcfc] dark:bg-[#0a0a0a] w-full max-w-[1000px] h-[700px] rounded-3xl shadow-2xl flex overflow-hidden border border-black/5 dark:border-white/10 relative pointer-events-auto transition-colors duration-300">
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 dark:opacity-20">
                                <circle cx="5%" cy="5%" r="50" stroke="currentColor" className="text-purple-500" strokeWidth="2" fill="none" opacity="0.5" />
                                <rect x="80%" y="10%" width="40" height="40" stroke="currentColor" className="text-blue-500" strokeWidth="2" fill="none" transform="rotate(45 82% 12%)" opacity="0.5" />
                                <path d="M 10% 80% Q 20% 70%, 30% 80% T 50% 80%" stroke="currentColor" className="text-pink-500" strokeWidth="2" fill="none" opacity="0.5" />
                                <circle cx="90%" cy="85%" r="30" stroke="currentColor" className="text-yellow-500" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.5" />
                                <path d="M 40% 10% L 42% 8% L 44% 10% L 46% 8%" stroke="currentColor" className="text-emerald-500" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                                <rect x="15%" y="40%" width="20" height="20" stroke="currentColor" className="text-orange-500" strokeWidth="2" fill="none" transform="rotate(-20 17% 42%)" opacity="0.5" />
                                <path d="M 70% 60% L 72% 58% M 72% 60% L 70% 58%" stroke="currentColor" className="text-red-500" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                            </svg>

                            <div className="w-[280px] bg-black/5 dark:bg-white/5 backdrop-blur-md flex-shrink-0 flex flex-col pt-8 px-4 border-r border-black/10 dark:border-white/10 z-10">
                                <div className="px-2 mb-8 flex items-center gap-4">
                                    <div className="relative group cursor-pointer" onClick={startEditing}>
                                        {user.avatar ? (
                                            <img src={user.avatar} className={cn("w-12 h-12 rounded-full object-cover transition-opacity group-hover:opacity-80 ring-2 ring-black/10 dark:ring-white/10", privacyMode && "blur-[5px]")} alt="Avatar" />
                                        ) : (
                                            <div className={cn("w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center transition-opacity group-hover:opacity-80 ring-2 ring-black/10 dark:ring-white/10", privacyMode && "blur-[5px]")}>
                                                <UserIcon size={24} className="text-black/50 dark:text-white/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className={cn("text-base font-caveat font-bold text-gray-900 dark:text-white leading-tight mb-0.5 truncate", privacyMode && "blur-[5px] select-none")}>{user.name || 'User'}</span>
                                        <button onClick={startEditing} className="text-xs text-gray-500 hover:text-gray-900 dark:text-white/40 dark:hover:text-white/70 cursor-pointer transition-colors text-left">Edit Profile</button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto customize-scrollbar px-2 space-y-6">
                                    {sidebarGroups.map((group, idx) => (
                                        <div key={idx}>
                                            <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest font-mono mb-2 px-3">{group.title}</h2>
                                            <div className="space-y-1">
                                                {group.items.map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 text-left group cursor-pointer font-caveat text-lg",
                                                            activeTab === tab.id
                                                                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm dark:shadow-lg shadow-black/5 dark:shadow-black/20"
                                                                : "text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white/80"
                                                        )}
                                                    >
                                                        <tab.icon size={18} className={cn("transition-colors", activeTab === tab.id ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/50")} />
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="border-t border-black/10 dark:border-white/10 pt-4 mx-2">
                                        <button
                                            onClick={() => {
                                                logout()
                                                onClose()
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 text-left text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 cursor-pointer group font-caveat text-lg"
                                        >
                                            <LogOut size={18} className="text-red-400 dark:text-red-400/70 group-hover:text-red-500 dark:group-hover:text-red-400" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>


                            <div className="flex-1 bg-white/50 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#111] flex flex-col relative min-w-0 z-10 transition-all duration-300">
                                <div className="flex-1 overflow-y-auto p-8 sm:p-12 customize-scrollbar">
                                    <div className="mb-8">
                                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-caveat flex items-center gap-3">
                                            {getTabLabel(activeTab)}
                                        </h1>
                                        <p className="text-gray-500 dark:text-white/40 text-sm mt-2 ml-1">Manage your {activeTab.replace('-', ' ')} settings.</p>
                                    </div>

                                    {activeTab === 'my-account' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm relative group shadow-sm dark:shadow-none">
                                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                                <div className="p-6">
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex items-center gap-5">
                                                            <div className="relative">
                                                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-black/5 to-transparent dark:from-white/10 dark:to-transparent border border-black/10 dark:border-white/10">
                                                                    {user.avatar ? (
                                                                        <img src={user.avatar} className={cn("w-full h-full rounded-full object-cover bg-gray-100 dark:bg-[#0a0a0a]", privacyMode && "blur-[5px]")} alt="Avatar" />
                                                                    ) : (
                                                                        <div className={cn("w-full h-full rounded-full bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center", privacyMode && "blur-[5px]")}>
                                                                            <UserIcon size={40} className="text-gray-400 dark:text-white/20" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isEditingProfile && (
                                                                    <button
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        disabled={isUploading}
                                                                        className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer border-4 border-white dark:border-[#0a0a0a]"
                                                                    >
                                                                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                                                                    </button>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    ref={fileInputRef}
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={handleAvatarUpload}
                                                                />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                {isEditingProfile ? (
                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label className="text-xs font-bold text-gray-500 dark:text-white/30 uppercase mb-1 block">Display Name</label>
                                                                            <input
                                                                                autoFocus
                                                                                type="text"
                                                                                value={displayName}
                                                                                onChange={(e) => setDisplayName(e.target.value)}
                                                                                className="w-full bg-gray-100 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white/90 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-white/20"
                                                                                placeholder="Enter your name"
                                                                            />
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={saveProfile}
                                                                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                                                            >
                                                                                Save
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setIsEditingProfile(false)}
                                                                                className="px-3 py-1.5 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <h2 className={cn("text-2xl font-bold text-gray-900 dark:text-white font-caveat", privacyMode && "blur-[6px] select-none")}>{user.name || 'User'}</h2>
                                                                        <p className={cn("text-gray-500 dark:text-white/40 text-sm mt-0.5 font-mono", privacyMode && "blur-[5px] select-none")}>{user.email}</p>
                                                                        <button
                                                                            onClick={startEditing}
                                                                            className="mt-3 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer font-medium flex items-center gap-1"
                                                                        >
                                                                            Edit User Profile <ArrowRight size={12} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                    <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Account Information</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center group">
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-500 dark:text-white/30 uppercase mb-1">Email</div>
                                                                <div className={cn("text-gray-900 dark:text-white/80 font-mono text-sm", privacyMode && "blur-[5px] select-none")}>
                                                                    {showEmail ? user.email : user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                                                                    <span className="ml-2 text-xs text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300" onClick={() => setShowEmail(!showEmail)}>{showEmail ? 'Hide' : 'Reveal'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'privacy' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <EyeOff size={100} className="text-gray-900 dark:text-white" />
                                                </div>

                                                <div className="flex items-center justify-between relative z-10 transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                            <EyeOff className="text-gray-900 dark:text-white/80" size={24} />
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Privacy Mode</span>
                                                            <span className="text-gray-500 dark:text-white/40 text-sm">
                                                                Hide sensitive information while you're broadcasting.
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={async () => {
                                                            const newValue = !privacyMode
                                                            setPrivacyMode(newValue)

                                                            try {
                                                                await secureFetch('/api/user/preferences', {
                                                                    method: 'PATCH',
                                                                    body: JSON.stringify({
                                                                        userHideProfileInfo: newValue
                                                                    })
                                                                })
                                                                await refreshUser()
                                                            } catch (err) {
                                                                console.error('Failed to update preference', err)
                                                                setPrivacyMode(!newValue)
                                                            }
                                                        }}
                                                        className={cn(
                                                            "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                            privacyMode
                                                                ? "bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                                                : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                            privacyMode ? "translate-x-6 scale-110" : "translate-x-0"
                                                        )} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Authentication</h3>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/10">
                                                                <Key className="text-gray-900 dark:text-white" size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 dark:text-white font-medium text-sm">Password</div>
                                                                <div className="text-gray-500 dark:text-white/40 text-xs mt-0.5">Last changed 3 months ago</div>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={process.env.NEXT_PUBLIC_NULLPASS_URL || "https://auth.nullpass.xyz"}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-black/10"
                                                        >
                                                            Change Password
                                                        </a>
                                                    </div>

                                                    <div className="w-full h-px bg-black/5 dark:bg-white/5" />

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/10">
                                                                <Smartphone className="text-gray-900 dark:text-white" size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 dark:text-white font-medium text-sm">Two-Factor Authentication</div>
                                                                <div className="text-gray-500 dark:text-white/40 text-xs mt-0.5">
                                                                    {user.twoFactorEnabled ? 'Securely enabled via NullPass' : 'Add an extra layer of security'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {user.twoFactorEnabled ? (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                                                                <Shield size={14} className="text-green-500 dark:text-green-400" />
                                                                <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider">Enabled</span>
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={process.env.NEXT_PUBLIC_NULLPASS_URL || "https://auth.nullpass.xyz"}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white text-sm font-bold rounded-xl transition-colors cursor-pointer border border-black/5 dark:border-white/10"
                                                            >
                                                                Enable 2FA
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'appearance' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Theme Preferences</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <button
                                                        onClick={() => setTheme('light')}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                            theme === 'light'
                                                                ? "border-blue-500 bg-blue-500/5"
                                                                : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-white dark:bg-black/20"
                                                        )}
                                                    >
                                                        <div className="w-full aspect-video rounded-lg bg-[#fcfcfc] border border-black/10 shadow-sm overflow-hidden relative">
                                                            <div className="absolute top-2 left-2 w-8 h-2 bg-black/5 rounded-full" />
                                                            <div className="absolute top-6 left-2 w-16 h-12 bg-black/5 rounded-lg" />
                                                            <div className="absolute top-6 left-20 right-2 bottom-2 bg-black/5 rounded-lg" />
                                                        </div>
                                                        <span className={cn("font-medium text-sm", theme === 'light' ? "text-blue-500" : "text-gray-500 dark:text-white/50")}>Light</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setTheme('dark')}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                            theme === 'dark'
                                                                ? "border-blue-500 bg-blue-500/5"
                                                                : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-white dark:bg-black/20"
                                                        )}
                                                    >
                                                        <div className="w-full aspect-video rounded-lg bg-[#0a0a0a] border border-white/10 shadow-sm overflow-hidden relative">
                                                            <div className="absolute top-2 left-2 w-8 h-2 bg-white/10 rounded-full" />
                                                            <div className="absolute top-6 left-2 w-16 h-12 bg-white/10 rounded-lg" />
                                                            <div className="absolute top-6 left-20 right-2 bottom-2 bg-white/10 rounded-lg" />
                                                        </div>
                                                        <span className={cn("font-medium text-sm", theme === 'dark' ? "text-blue-500" : "text-gray-500 dark:text-white/50")}>Dark</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setTheme('system')}
                                                        className={cn(
                                                            "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                            theme === 'system'
                                                                ? "border-blue-500 bg-blue-500/5"
                                                                : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-white dark:bg-black/20"
                                                        )}
                                                    >
                                                        <div className="w-full aspect-video rounded-lg border border-black/10 dark:border-white/10 shadow-sm overflow-hidden relative bg-[#fcfcfc]">
                                                            <div className="absolute top-2 left-2 w-8 h-2 bg-black/5 rounded-full" />
                                                            <div className="absolute top-6 left-2 w-16 h-12 bg-black/5 rounded-lg" />
                                                            <div className="absolute top-6 left-20 right-2 bottom-2 bg-black/5 rounded-lg" />
                                                            <div className="absolute inset-0 bg-[#0a0a0a]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
                                                                <div className="absolute top-2 left-2 w-8 h-2 bg-white/10 rounded-full" />
                                                                <div className="absolute top-6 left-2 w-16 h-12 bg-white/10 rounded-lg" />
                                                                <div className="absolute top-6 left-20 right-2 bottom-2 bg-white/10 rounded-lg" />
                                                            </div>
                                                        </div>
                                                        <span className={cn("font-medium text-sm", theme === 'system' ? "text-blue-500" : "text-gray-500 dark:text-white/50")}>System</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Document Theme</h3>
                                                <p className="text-sm text-gray-500 dark:text-white/40 mb-4">Choose a background color for your canvas.</p>

                                                <div className="flex flex-wrap gap-3">
                                                    {(resolvedTheme === 'dark'
                                                        ? ['#121212', '#000000', '#18181b', '#0f172a', '#1e1b4b']
                                                        : ['#ffffff', '#fdfbf7', '#f4f4f5', '#eef2ff', '#fff1f2']
                                                    ).map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setCanvasColor(color)}
                                                            className={cn(
                                                                "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer shadow-sm relative",
                                                                canvasColor === color
                                                                    ? "border-blue-500 scale-110"
                                                                    : "border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:scale-105"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                            aria-label={`Select color ${color}`}
                                                        >
                                                            {canvasColor === color && (
                                                                <div className={cn(
                                                                    "p-1 rounded-full",
                                                                    resolvedTheme === 'dark' ? "bg-white text-black" : "bg-black text-white"
                                                                )}>
                                                                    <Check size={12} strokeWidth={3} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Performance</h3>
                                                <div className="space-y-4">
                                                    <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <Layout size={100} className="text-gray-900 dark:text-white" />
                                                        </div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                    <Layout className="text-gray-900 dark:text-white/80" size={24} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Disable Client Side Object Animations</span>
                                                                    <span className="text-gray-500 dark:text-white/40 text-sm">Turn off animations for better performance</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    const newValue = !disableAnimations
                                                                    setDisableAnimations(newValue)

                                                                    try {
                                                                        await secureFetch('/api/user/preferences', {
                                                                            method: 'PATCH',
                                                                            body: JSON.stringify({
                                                                                animTurnedOff: newValue
                                                                            })
                                                                        })
                                                                        await refreshUser()
                                                                    } catch (err) {
                                                                        console.error('Failed to update preference', err)
                                                                        setDisableAnimations(!newValue)
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                    disableAnimations
                                                                        ? "bg-green-500 border-green-400"
                                                                        : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                    disableAnimations ? "translate-x-6 scale-110" : "translate-x-0"
                                                                )} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'keybinds' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <div className="p-4 border-b border-black/5 dark:border-white/10 bg-gray-50/50 dark:bg-black/20">
                                                    <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                                                </div>
                                                <div className="divide-y divide-black/5 dark:divide-white/5">
                                                    {[
                                                        { label: 'Undo', key: 'Ctrl + Z' },
                                                        { label: 'Redo', key: 'Ctrl + Y' },
                                                        { label: 'Save', key: 'Ctrl + S' },
                                                        { label: 'Command Palette', key: 'Ctrl + K' },
                                                        { label: 'Select All', key: 'Ctrl + A' },
                                                        { label: 'Copy', key: 'Ctrl + C' },
                                                        { label: 'Paste', key: 'Ctrl + V' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-white/80">{item.label}</span>
                                                            <div className="flex gap-1">
                                                                {item.key.split(' + ').map((k, j) => (
                                                                    <kbd key={j} className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-500 dark:text-white/50 font-mono shadow-sm">
                                                                        {k}
                                                                    </kbd>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'billing' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Subscription Plan</h3>

                                                <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                                        <CreditCard size={120} className="text-black dark:text-white" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <div className="inline-flex px-3 py-1 rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider mb-4 text-gray-900 dark:text-white">
                                                            {user.isPremium ? 'Premium Plan' : 'Free Plan'}
                                                        </div>
                                                        <div className="text-3xl font-bold font-caveat mb-2 text-gray-900 dark:text-white">
                                                            {user.isPremium ? 'Pro Membership' : 'Basic Membership'}
                                                        </div>
                                                        <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-[80%] mb-6">
                                                            {user.isPremium
                                                                ? 'You have access to all premium features, unlimited workspaces, and priority support.'
                                                                : 'Upgrade to Pro to unlock unlimited workspaces, advanced export options, and more.'}
                                                        </p>

                                                        <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                                                            {user.isPremium ? 'Manage Subscription' : 'Upgrade to Pro'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'whiteboard' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Whiteboard Settings</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                                                                <Box className="text-gray-900 dark:text-white" size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-900 dark:text-white font-medium text-sm">Object Count</div>
                                                                <div className="text-gray-500 dark:text-white/40 text-xs mt-0.5">Total elements on the current canvas</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{elementCount} / 500</span>
                                                            <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/20" />
                                                            <span className="text-xs font-medium text-gray-500 dark:text-white/40">Free Limit</span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <Bug size={100} className="text-gray-900 dark:text-white" />
                                                        </div>
                                                        <div className="p-6">
                                                            <div className="flex items-center justify-between relative z-10">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                        <Bug className="text-gray-900 dark:text-white/80" size={24} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Debug View</span>
                                                                        <span className="text-gray-500 dark:text-white/40 text-sm">Show technical overlay for debugging</span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={async () => {
                                                                        const newValue = !debugView
                                                                        setDebugView(newValue)

                                                                        // Jeśli wyłączamy debug view, wyłącz też always show
                                                                        const updates: { debView: boolean; debViewAlw?: boolean } = {
                                                                            debView: newValue
                                                                        }
                                                                        if (!newValue && debViewAlw) {
                                                                            setDebViewAlw(false)
                                                                            updates.debViewAlw = false
                                                                        }

                                                                        try {
                                                                            await secureFetch('/api/user/preferences', {
                                                                                method: 'PATCH',
                                                                                body: JSON.stringify(updates)
                                                                            })
                                                                            await refreshUser()
                                                                        } catch (err) {
                                                                            console.error('Failed to update preference', err)
                                                                            setDebugView(!newValue)
                                                                            if (!newValue && debViewAlw) {
                                                                                setDebViewAlw(true)
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                        debugView
                                                                            ? "bg-green-500 border-green-400"
                                                                            : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                        debugView ? "translate-x-6 scale-110" : "translate-x-0"
                                                                    )} />
                                                                </button>
                                                            </div>

                                                            {debugView && (
                                                                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3 ml-16">
                                                                            <div className="w-px h-6 bg-gray-300 dark:bg-white/20"></div>
                                                                            <div>
                                                                                <span className="text-gray-900 dark:text-white font-caveat text-lg font-bold block">Always On</span>
                                                                                <span className="text-gray-500 dark:text-white/40 text-xs">Show debug overlay on all elements, always</span>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const newValue = !debViewAlw
                                                                                setDebViewAlw(newValue)

                                                                                try {
                                                                                    await secureFetch('/api/user/preferences', {
                                                                                        method: 'PATCH',
                                                                                        body: JSON.stringify({
                                                                                            debViewAlw: newValue
                                                                                        })
                                                                                    })
                                                                                    await refreshUser()
                                                                                } catch (err) {
                                                                                    console.error('Failed to update preference', err)
                                                                                    setDebViewAlw(!newValue)
                                                                                }
                                                                            }}
                                                                            className={cn(
                                                                                "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                                debViewAlw
                                                                                    ? "bg-green-500 border-green-400"
                                                                                    : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                            )}
                                                                        >
                                                                            <div className={cn(
                                                                                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                                debViewAlw ? "translate-x-6 scale-110" : "translate-x-0"
                                                                            )} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'manage-workspaces' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white">Your Workspaces</h3>
                                                        <p className="text-sm text-gray-500 dark:text-white/40">Manage your local workspaces</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isCreatingWorkspace ? (
                                                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    placeholder="Workspace Name"
                                                                    value={newWorkspaceName}
                                                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && newWorkspaceName.trim()) {
                                                                            createWorkspace(newWorkspaceName.trim())
                                                                            setNewWorkspaceName('')
                                                                            setIsCreatingWorkspace(false)
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setIsCreatingWorkspace(false)
                                                                            setNewWorkspaceName('')
                                                                        }
                                                                    }}
                                                                    className="w-40 h-8 px-3 text-xs bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-gray-900 dark:text-white"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        if (newWorkspaceName.trim()) {
                                                                            createWorkspace(newWorkspaceName.trim())
                                                                            setNewWorkspaceName('')
                                                                            setIsCreatingWorkspace(false)
                                                                        }
                                                                    }}
                                                                    disabled={!newWorkspaceName.trim()}
                                                                    className="h-8 px-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    Add
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsCreatingWorkspace(false)
                                                                        setNewWorkspaceName('')
                                                                    }}
                                                                    className="h-8 w-8 flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setIsCreatingWorkspace(true)}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                                                            >
                                                                <Plus size={14} />
                                                                <span>Create</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {workspaces.map((workspace) => (
                                                        <div
                                                            key={workspace.id}
                                                            className={cn(
                                                                "group flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                                                                activeWorkspaceId === workspace.id
                                                                    ? "bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/10"
                                                                    : "bg-gray-50 dark:bg-black/20 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                                                    activeWorkspaceId === workspace.id
                                                                        ? "bg-white dark:bg-white/20 border-black/5 dark:border-white/10 text-gray-900 dark:text-white"
                                                                        : "bg-white dark:bg-white/5 border-black/5 dark:border-white/5 text-gray-500 dark:text-white/40"
                                                                )}>
                                                                    <FolderOpen size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn(
                                                                            "font-bold text-sm",
                                                                            activeWorkspaceId === workspace.id ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-zinc-400"
                                                                        )}>
                                                                            {workspace.name}
                                                                        </span>
                                                                        {activeWorkspaceId === workspace.id && (
                                                                            <span className="text-[10px] font-bold bg-black/10 dark:bg-white/20 text-gray-900 dark:text-white px-1.5 py-0.5 rounded">Active</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                                                                        Edited {new Date(workspace.lastModified).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {activeWorkspaceId !== workspace.id && (
                                                                    <button
                                                                        onClick={() => {
                                                                            switchWorkspace(workspace.id)
                                                                        }}
                                                                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                                                                        title="Switch to this workspace"
                                                                    >
                                                                        <LogIn size={16} />
                                                                    </button>
                                                                )}
                                                                {workspace.id !== 'default' && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            if (workspaces.length > 1) {
                                                                                setWorkspaceToDelete(workspace.id)
                                                                            }
                                                                        }}
                                                                        disabled={workspaces.length <= 1}
                                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-gray-400 dark:text-white/20 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                        title="Delete workspace"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'collaboration' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Collaboration Settings</h3>
                                                <div className="space-y-4">

                                                    <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <Users size={100} className="text-gray-900 dark:text-white" />
                                                        </div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                    <Users className="text-gray-900 dark:text-white/80" size={24} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Real-time Cursors</span>
                                                                    <span className="text-gray-500 dark:text-white/40 text-sm">Show other users' cursors on the canvas</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setColabCursors(!colabCursors)}
                                                                className={cn(
                                                                    "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                    colabCursors
                                                                        ? "bg-green-500 border-green-400"
                                                                        : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                    colabCursors ? "translate-x-6 scale-110" : "translate-x-0"
                                                                )} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <Shield size={100} className="text-gray-900 dark:text-white" />
                                                        </div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                    <Shield className="text-gray-900 dark:text-white/80" size={24} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Guest Edit Access</span>
                                                                    <span className="text-gray-500 dark:text-white/40 text-sm">Allow guests to edit without signing in</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setColabGuestAccess(!colabGuestAccess)}
                                                                className={cn(
                                                                    "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                    colabGuestAccess
                                                                        ? "bg-green-500 border-green-400"
                                                                        : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                    colabGuestAccess ? "translate-x-6 scale-110" : "translate-x-0"
                                                                )} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                                            <UserIcon size={100} className="text-gray-900 dark:text-white" />
                                                        </div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                    <UserIcon className="text-gray-900 dark:text-white/80" size={24} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Participant List</span>
                                                                    <span className="text-gray-500 dark:text-white/40 text-sm">Show list of active users in session</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setColabShowParticipants(!colabShowParticipants)}
                                                                className={cn(
                                                                    "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                    colabShowParticipants
                                                                        ? "bg-green-500 border-green-400"
                                                                        : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                    colabShowParticipants ? "translate-x-6 scale-110" : "translate-x-0"
                                                                )} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'cloud-sync' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4">Cloud Sync Status</h3>

                                                <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                                        <Cloud size={100} className="text-gray-900 dark:text-white" />
                                                    </div>

                                                    <div className="flex items-center justify-between relative z-10 transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center">
                                                                <Cloud className="text-gray-900 dark:text-white/80" size={24} />
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-900 dark:text-white font-caveat text-xl font-bold block">Cloud Sync</span>
                                                                <span className="text-gray-500 dark:text-white/40 text-sm">
                                                                    Sync your workspaces across all devices.
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={async () => {
                                                                const newValue = !cloudSyncEnabled
                                                                setCloudSyncEnabled(newValue)

                                                                try {
                                                                    await secureFetch('/api/user/preferences', {
                                                                        method: 'PATCH',
                                                                        body: JSON.stringify({
                                                                            cloudSyncEnabled: newValue
                                                                        })
                                                                    })
                                                                    await refreshUser()
                                                                } catch (err) {
                                                                    console.error('Failed to update preference', err)
                                                                    setCloudSyncEnabled(!newValue)
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-14 h-8 rounded-full transition-all duration-300 relative cursor-pointer border-2",
                                                                cloudSyncEnabled
                                                                    ? "bg-green-500 border-green-400"
                                                                    : "bg-gray-200 dark:bg-black/40 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                                                cloudSyncEnabled ? "translate-x-6 scale-110" : "translate-x-0"
                                                            )} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(activeTab === 'fonts' || activeTab === 'brushes' || activeTab === 'templates' || activeTab === 'icons') && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                                            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-sm dark:shadow-none">
                                                <h3 className="text-lg font-caveat font-bold text-gray-900 dark:text-white mb-4 capitalize">
                                                    {activeTab} Library
                                                </h3>

                                                <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl p-12 backdrop-blur-sm relative overflow-hidden shadow-sm dark:shadow-none flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center mb-4">
                                                        {activeTab === 'fonts' && <Type size={32} className="text-gray-900 dark:text-white/60" />}
                                                        {activeTab === 'brushes' && <Brush size={32} className="text-gray-900 dark:text-white/60" />}
                                                        {activeTab === 'templates' && <Form size={32} className="text-gray-900 dark:text-white/60" />}
                                                        {activeTab === 'icons' && <ThumbsUp size={32} className="text-gray-900 dark:text-white/60" />}
                                                    </div>
                                                    <h4 className="text-gray-900 dark:text-white font-medium mb-1">No {activeTab} found</h4>
                                                    <p className="text-gray-500 dark:text-white/40 text-sm max-w-xs mx-auto mb-6">
                                                        You haven't added any custom {activeTab} to your library yet.
                                                    </p>
                                                    <button className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2">
                                                        <Plus size={16} />
                                                        Upload {activeTab.slice(0, -1)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10">
                                        <div className="flex flex-col gap-2 items-center group">
                                            <button
                                                onClick={onClose}
                                                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black/10 dark:border-white/10 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                            >
                                                <X size={20} />
                                            </button>
                                            <span className="text-[10px] text-black/20 dark:text-white/20 font-bold uppercase tracking-widest group-hover:text-black/40 dark:group-hover:text-white/40 transition-colors">Esc</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <WorkspaceDeletePrompt
                        isOpen={!!workspaceToDelete}
                        onConfirm={() => {
                            if (workspaceToDelete) {
                                deleteWorkspace(workspaceToDelete)
                                setWorkspaceToDelete(null)
                            }
                        }}
                        onCancel={() => setWorkspaceToDelete(null)}
                    />
                </>
            )}
        </AnimatePresence>
    )
}