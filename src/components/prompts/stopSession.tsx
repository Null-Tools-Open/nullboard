'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StopSessionPromptProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    isHost?: boolean
}

export function StopSessionPrompt({ isOpen, onConfirm, onCancel, isHost = false }: StopSessionPromptProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/50 z-[105]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[106] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 p-6 w-96"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                                {isHost ? 'End Session' : 'Leave Room'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                {isHost
                                    ? "Are you sure you want to end the session? Everyone will be disconnected. You can continue working locally."
                                    : "Are you sure you want to leave? You will be disconnected but can continue working locally."}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                {isHost ? 'End Session' : 'Leave Room'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}