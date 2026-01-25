'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Users, Check, Lock, Square, LogIn, LogOut, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { StopSessionPrompt } from './stopSession'
import { useAuth } from '@/hooks/useAuth'

interface RealTimeColabPromptProps {
    isOpen: boolean
    onClose: () => void
    onStartSession: (roomId: string, isCreating: boolean) => void
    activeRoomId?: string
    connectionStatus?: 'connecting' | 'connected' | 'disconnected'
    isHost?: boolean
    onStopSession?: () => void
    activeUsers?: Array<{ identifier?: string; name: string; color: string; avatar?: string }>
}

function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 6) + '-' +
        Math.random().toString(36).substring(2, 6) + '-' +
        Math.random().toString(36).substring(2, 6)
}

function sanitizeNickname(nickname: string): string {
    return nickname
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 30)
}

export function RealTimeColabPrompt({ isOpen, onClose, onStartSession, activeRoomId, connectionStatus = 'disconnected', isHost = false, onStopSession }: RealTimeColabPromptProps) {
    const { user } = useAuth()
    const [mode, setMode] = useState<'start' | 'join'>('start')
    const [copied, setCopied] = useState(false)
    const [joinRoomInput, setJoinRoomInput] = useState('')
    const [sessionUrl, setSessionUrl] = useState('')
    const [userName, setUserName] = useState('')
    const [showStopConfirm, setShowStopConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const isActive = !!activeRoomId
    const roomId = activeRoomId || ''

    useEffect(() => {
        if (activeRoomId) {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            setSessionUrl(`${baseUrl}?room=${activeRoomId}`)
            setIsLoading(false)
        } else {
            setSessionUrl('')
        }
    }, [activeRoomId])

    useEffect(() => {
        if (!user) {
            const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Calm', 'Eager', 'Gentle', 'Jolly', 'Kind', 'Lively']
            const animals = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Owl', 'Bear', 'Lion', 'Hawk']
            const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`
            setUserName(randomName)
        } else {
            setUserName(user.name ? sanitizeNickname(user.name) : user.email.split('@')[0])
        }
    }, [user])

    useEffect(() => {
        if (activeRoomId) {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            setSessionUrl(`${baseUrl}?room=${activeRoomId}`)
        } else {
            setSessionUrl('')
        }
    }, [activeRoomId])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sessionUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStartSession = () => {
        setIsLoading(true)
        const newRoomId = generateRoomId()

        if (onStartSession) {
            onStartSession(newRoomId, true)
        }
    }

    const handleJoinRoom = () => {
        if (!joinRoomInput.trim()) return
        setIsLoading(true)

        let cleanRoomId = joinRoomInput.trim()

        if (cleanRoomId.includes('room=')) {
            try {
                const urlObj = new URL(cleanRoomId, window.location.href)
                const id = urlObj.searchParams.get('room')
                if (id) cleanRoomId = id
            } catch (e) {
                const match = cleanRoomId.match(/[?&]room=([^&]+)/)
                if (match) cleanRoomId = match[1]
            }
        }

        if (onStartSession) {
            onStartSession(cleanRoomId, false)
        }
    }

    const handleStopSession = () => {
        if (onStopSession) {
            onStopSession()
        }
        setShowStopConfirm(false)
        onClose()
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
                        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-8 w-[500px]"
                    >
                        {!isActive ? (
                            <div className="flex flex-col items-center text-center">
                                <Users className="w-12 h-12 text-[#A8A5FF] mb-6" />

                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
                                    Real-time Collaboration
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 font-medium">
                                    Invite people to draw together.
                                </p>

                                <p className="text-gray-500 dark:text-zinc-500 text-sm mb-8 leading-relaxed max-w-sm">
                                    Your session is end-to-end encrypted and fully private. Not even our servers have access to your drawings.
                                </p>

                                <div className="flex gap-2 w-full mb-6">
                                    <button
                                        onClick={() => setMode('start')}
                                        className={cn(
                                            "flex-1 py-3 rounded-lg font-semibold transition-all",
                                            mode === 'start'
                                                ? "bg-[#A8A5FF] text-white"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        Start New
                                    </button>
                                    <button
                                        onClick={() => setMode('join')}
                                        className={cn(
                                            "flex-1 py-3 rounded-lg font-semibold transition-all",
                                            mode === 'join'
                                                ? "bg-[#A8A5FF] text-white"
                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"
                                        )}
                                    >
                                        Join Room
                                    </button>
                                </div>

                                {mode === 'start' ? (
                                    <button
                                        onClick={handleStartSession}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-[#A8A5FF] hover:bg-[#9693ff] text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Users size={24} />}
                                        {isLoading ? 'Starting...' : 'Start Session'}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Enter room ID (e.g., abc-def-ghi)"
                                            value={joinRoomInput}
                                            onChange={(e) => setJoinRoomInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                                            className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#A8A5FF]/50 transition-all font-medium"
                                        />
                                        <button
                                            onClick={handleJoinRoom}
                                            disabled={!joinRoomInput.trim() || isLoading}
                                            className={cn(
                                                "w-full py-4 rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-3",
                                                joinRoomInput.trim() && !isLoading
                                                    ? "bg-[#A8A5FF] hover:bg-[#9693ff] text-white shadow-indigo-500/20 cursor-pointer"
                                                    : "bg-gray-300 dark:bg-zinc-700 text-gray-500 dark:text-zinc-500 cursor-not-allowed"
                                            )}
                                        >
                                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <LogIn size={24} />}
                                            {isLoading ? 'Joining...' : 'Join Session'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                                        Real-time collaboration
                                    </h3>
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full animate-pulse",
                                            connectionStatus === 'connected' ? "bg-green-500" :
                                                connectionStatus === 'connecting' ? "bg-yellow-500" : "bg-red-500"
                                        )} />
                                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 capitalize">
                                            {connectionStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2 block">
                                        Your name
                                    </label>

                                    {user ? (
                                        <div className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={userName}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#A8A5FF] flex items-center justify-center text-white font-bold text-sm">
                                                    {userName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="text-gray-900 dark:text-zinc-100 font-medium">
                                                {userName}
                                            </span>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#A8A5FF]/50 transition-all font-medium"
                                        />
                                    )}
                                </div>

                                <div className="mb-8">
                                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2 block">
                                        Link
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            readOnly
                                            value={sessionUrl}
                                            className="flex-1 bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-600 dark:text-zinc-400 font-mono text-sm truncate focus:outline-none"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className={cn(
                                                "px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all cursor-pointer whitespace-nowrap",
                                                copied
                                                    ? "bg-green-500 text-white"
                                                    : "bg-[#A8A5FF] hover:bg-[#9693ff] text-white"
                                            )}
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                            {copied ? 'Copied' : 'Copy link'}
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-gray-200 dark:bg-zinc-800 mb-6" />

                                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/20 rounded-lg p-3 flex gap-3 mb-4">
                                    <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                        Your session is end-to-end encrypted and fully private. Not even our servers have access to your drawings.
                                    </p>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-zinc-500 mb-8 leading-relaxed">
                                    {isHost
                                        ? "End Session will end the collaboration for everyone. Note that you'll be able to continue working locally."
                                        : "Leave room will disconnect you from the collaboration. Others will be able to continue working together."
                                    }
                                </p>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowStopConfirm(true)}
                                        className={cn(
                                            "px-8 py-3 border rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-medium",
                                            isHost
                                                ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30"
                                                : "text-gray-600 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-gray-200 dark:border-zinc-700"
                                        )}
                                    >
                                        {isHost ? (
                                            <>
                                                <Square size={16} className="fill-current" />
                                                End Session
                                            </>
                                        ) : (
                                            <>
                                                <LogOut size={16} />
                                                Leave room
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono text-center">
                                    Status: {connectionStatus} | Role: {isHost ? 'HOST' : 'GUEST'}
                                    <br />
                                    Room: {roomId} | Active: {activeRoomId || 'none'}
                                </div>
                            </motion.div>
                        )}

                        <StopSessionPrompt
                            isOpen={showStopConfirm}
                            onCancel={() => setShowStopConfirm(false)}
                            onConfirm={handleStopSession}
                            isHost={isHost}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}