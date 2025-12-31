'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DropImportProps {
    isOpen: boolean
    onClose: () => void
}

export function DropImport({ isOpen, onClose }: DropImportProps) {
    const router = useRouter()

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
                        transition={{ duration: 0.2 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 p-6 w-full max-w-md"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                                <Crown className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                                License Required
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 max-w-sm">
                                Drag & drop file import is available exclusively for users with a valid License. Please purchase a license to unlock this feature.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => router.push('/license')}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                                >
                                    Get License
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}