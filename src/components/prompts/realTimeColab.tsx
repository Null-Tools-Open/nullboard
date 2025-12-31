'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Users, Check, Lock, Square } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { StopSessionPrompt } from './stopSession'

interface RealTimeColabPromptProps {
    isOpen: boolean
    onClose: () => void
    onStartSession: () => void
}

export function RealTimeColabPrompt({ isOpen, onClose, onStartSession }: RealTimeColabPromptProps) {
    const [isActive, setIsActive] = useState(false)
    const [copied, setCopied] = useState(false)
    const [sessionUrl] = useState('https://nixt.app/collab/7x8d-9f2k-3m4n')
    const [userName, setUserName] = useState('Orderly Jaguar')
    const [showStopConfirm, setShowStopConfirm] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sessionUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStartSession = () => {
        setIsActive(true)
        onStartSession()
    }

    const handleStopSession = () => {
        setIsActive(false)
        setShowStopConfirm(false)
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

                                <button
                                    onClick={handleStartSession}
                                    className="w-full py-4 bg-[#A8A5FF] hover:bg-[#9693ff] text-white rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <Users size={24} />
                                    Start Session
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-6">
                                    Real-time collaboration
                                </h3>

                                <div className="mb-6">
                                    <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 mb-2 block">
                                        Your name
                                    </label>
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#A8A5FF]/50 transition-all font-medium"
                                    />
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
                                    Stop session will disconnect you from the room, but you'll be able to continue working locally. Note that people you collaborated with will still be able to collaborate.
                                </p>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setShowStopConfirm(true)}
                                        className="px-8 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-medium"
                                    >
                                        <Square size={16} className="fill-current" />
                                        Stop session
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}

            <StopSessionPrompt
                isOpen={showStopConfirm}
                onConfirm={handleStopSession}
                onCancel={() => setShowStopConfirm(false)}
            />
        </AnimatePresence>
    )
}