'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Kbd } from '@/components/ui/kbd'

interface HelpDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
    useEffect(() => {
        if (!isOpen) return
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <a href="https://docs.nullboard.xyz" target="_blank" rel="noopener noreferrer" className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group border border-gray-200 dark:border-zinc-700/50">
                            <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                                Documentation
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">Read the guide</div>
                        </a>
                        <a href="https://github.com/Null-Tools-Open/nullboard" target="_blank" rel="noopener noreferrer" className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group border border-gray-200 dark:border-zinc-700/50">
                            <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                                Github
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">Report issues</div>
                        </a>
                        <a href="https://discord.gg/7WMZh7jjEB" target="_blank" rel="noopener noreferrer" className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group border border-gray-200 dark:border-zinc-700/50">
                            <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                                Discord
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">Join community</div>
                        </a>
                        <a href="https://x.com/NullToolsXYZ" target="_blank" rel="noopener noreferrer" className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors group border border-gray-200 dark:border-zinc-700/50">
                            <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                                Twitter
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400">Follow updates</div>
                        </a>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Keyboard Shortcuts</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Tools</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Hand (Pan)</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">H</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">1</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Selection</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">V</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">2</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Rectangle</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">R</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">3</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Diamond</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">D</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">4</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Circle</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">C</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">5</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Arrow</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">A</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">6</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Line</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">L</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">7</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Draw</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">P</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">8</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Text</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">T</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">9</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Image</span>
                                    <div className="flex items-center gap-1.5">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">I</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">0</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Eraser</span>
                                    <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">E</Kbd>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Frame</span>
                                    <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">F</Kbd>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Laser</span>
                                    <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded uppercase font-sans">K</Kbd>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-4 uppercase tracking-wider">Editor</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Undo</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Z</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Redo</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Y</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Select All</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">A</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Delete</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Del</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Duplicate</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">D</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Copy</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">C</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Paste</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">V</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Command Palette</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">/</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Find on Canvas</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">F</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Pan Workspace</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 h-6 text-xs flex items-center justify-center px-2 rounded font-sans">Middle Click</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 h-6 text-xs flex items-center justify-center px-2 rounded font-sans">Hold H</Kbd>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800/50 last:border-0">
                                    <span className="text-sm text-gray-700 dark:text-zinc-300">Zoom</span>
                                    <div className="flex items-center gap-1">
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Ctrl</Kbd>
                                        <span className="text-xs text-gray-400">or</span>
                                        <Kbd className="bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 min-w-[24px] h-6 text-xs flex items-center justify-center px-1.5 rounded font-sans">Wheel</Kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}