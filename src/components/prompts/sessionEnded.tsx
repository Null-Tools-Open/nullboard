'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

interface SessionEndedPromptProps {
    isOpen: boolean
    onClose: () => void
}

export function SessionEndedPrompt({ isOpen, onClose }: SessionEndedPromptProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[105] backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[106] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 p-8 w-[400px] text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <WifiOff className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3">
                            Session Ended
                        </h3>

                        <p className="text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            The host has ended the collaboration session. You can continue working locally with your current canvas.
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-[#A8A5FF] hover:bg-[#9693ff] text-white rounded-lg font-semibold transition-all cursor-pointer"
                        >
                            Continue Locally
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}