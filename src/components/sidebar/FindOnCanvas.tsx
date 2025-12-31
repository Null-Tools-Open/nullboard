'use client'

import { useState, useMemo, useEffect } from 'react'
import { CanvasElement } from '../canvas/shared'
import { Search, X, BookOpen, MessageSquare, Presentation, Square, Circle, Diamond, Minus, ArrowRight, Type, Image as ImageIcon, Box, PenTool, Link, Pin, MoreVertical, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FindOnCanvasProps {
    isOpen: boolean
    onClose: () => void
    elements: CanvasElement[]
    onSelectElement: (elementId: string) => void
}

const Comments = []

export function FindOnCanvas({ isOpen, onClose, elements, onSelectElement }: FindOnCanvasProps) {
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'search' | 'library' | 'chat' | 'presentation'>('search')
    const [isPinned, setIsPinned] = useState(false)

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

    const filteredElements = useMemo(() => {
        if (!query) return []
        const lowerQuery = query.toLowerCase()
        return elements.filter(el => {

            if (el.type === 'text' && el.text && el.text.toLowerCase().includes(lowerQuery)) {
                return true
            }

            if (el.type === 'frame' && el.name && el.name.toLowerCase().includes(lowerQuery)) {
                return true
            }

            let typeName = ''

            switch (el.type) {
                case 'rect': typeName = 'rectangle'; break;
                case 'diamond': typeName = 'diamond'; break;
                case 'circle': typeName = 'circle'; break;
                case 'line': typeName = 'line'; break;
                case 'arrow': typeName = 'arrow'; break;
                case 'image': typeName = 'image'; break;
                case 'frame': typeName = 'frame'; break;
                case 'embed': typeName = 'embed'; break;
                case 'path': typeName = 'draw'; break;
                case 'text': typeName = 'text'; break;
            }
            if (typeName.includes(lowerQuery)) {
                return true
            }

            return false
        })
    }, [elements, query])

    const getElementDisplay = (el: CanvasElement) => {
        switch (el.type) {
            case 'text': return { title: el.text || 'Empty Text', subtitle: 'Text Element', icon: Type }
            case 'frame': return { title: el.name || 'Frame', subtitle: 'Frame Element', icon: Box }
            case 'rect': return { title: 'Rectangle', subtitle: 'Shape', icon: Square }
            case 'diamond': return { title: 'Diamond', subtitle: 'Shape', icon: Diamond }
            case 'circle': return { title: 'Circle', subtitle: 'Shape', icon: Circle }
            case 'line': return { title: 'Line', subtitle: 'Shape', icon: Minus }
            case 'arrow': return { title: 'Arrow', subtitle: 'Shape', icon: ArrowRight }
            case 'image': return { title: 'Image', subtitle: 'Media', icon: ImageIcon }
            case 'embed': return { title: 'Embed', subtitle: 'Media', icon: Link }
            case 'path': return { title: 'Draw', subtitle: 'Drawing', icon: PenTool }
            default: return { title: 'Unknown', subtitle: 'Element', icon: Square }
        }
    }

    if (!isOpen) return null

    return (
        <div className="w-80 h-full bg-white dark:bg-zinc-800 border-l border-gray-200 dark:border-zinc-700 flex flex-col z-50 shadow-xl shrink-0">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-zinc-700">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900/50 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={cn(
                            "p-1.5 rounded-md transition-all cursor-pointer",
                            activeTab === 'search' ? "bg-blue-500 dark:bg-blue-600 text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700/50"
                        )}
                        title="Search"
                    >
                        <Search size={16} />
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={cn(
                            "p-1.5 rounded-md transition-all cursor-pointer",
                            activeTab === 'library' ? "bg-blue-500 dark:bg-blue-600 text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700/50"
                        )}
                        title="Library"
                    >
                        <BookOpen size={16} />
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={cn(
                            "p-1.5 rounded-md transition-all cursor-pointer",
                            activeTab === 'chat' ? "bg-blue-500 dark:bg-blue-600 text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700/50"
                        )}
                        title="Chat"
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button
                        onClick={() => setActiveTab('presentation')}
                        className={cn(
                            "p-1.5 rounded-md transition-all cursor-pointer",
                            activeTab === 'presentation' ? "bg-blue-500 dark:bg-blue-600 text-white" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700/50"
                        )}
                        title="Presentation"
                    >
                        <Presentation size={16} />
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsPinned(!isPinned)}
                        className={cn(
                            "p-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-colors",
                            isPinned ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
                        )}
                        title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                    >
                        <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700/50">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {activeTab === 'search' && (
                <>
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 w-4 h-4" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Find on canvas..."
                                className="w-full bg-gray-100 dark:bg-zinc-900/50 text-gray-900 dark:text-zinc-100 text-sm rounded-lg pl-9 pr-4 py-2.5 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 outline-none placeholder:text-gray-500 dark:placeholder:text-zinc-500 transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 pb-2">
                        {query && filteredElements.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-zinc-400 text-sm mt-8">No results found</div>
                        )}
                        {!query && (
                            <div className="text-center text-gray-500 dark:text-zinc-400 text-sm mt-8 opacity-50">Type to search...</div>
                        )}
                        {filteredElements.map(el => {
                            const { title, subtitle, icon: Icon } = getElementDisplay(el)
                            return (
                                <button
                                    key={el.id}
                                    onClick={() => onSelectElement(el.id)}
                                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg group transition-colors mb-1 border border-transparent hover:border-gray-200 dark:hover:border-zinc-600 flex items-center justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="text-gray-900 dark:text-zinc-100 text-sm truncate font-medium">
                                            {title}
                                        </div>
                                        <div className="text-gray-500 dark:text-zinc-400 text-xs mt-1 group-hover:text-gray-600 dark:group-hover:text-zinc-300">
                                            {subtitle}
                                        </div>
                                    </div>
                                    <Icon className="text-gray-500 dark:text-zinc-500 group-hover:text-gray-700 dark:group-hover:text-zinc-300 transition-colors" size={16} />
                                </button>
                            )
                        })}
                    </div>
                </>
            )}

            {activeTab === 'library' && (
                <div className="flex-1 flex flex-col relative bg-white dark:bg-zinc-800">
                    <div className="absolute top-4 right-4 z-10">
                        <button className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700/50">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <h3 className="text-[#A8A5FF] font-semibold text-lg mb-4">No elements added yet...</h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6 max-w-[240px] leading-relaxed">
                            Select an element on the canvas to add it here, or install a library from the public repository below.
                        </p>
                        <button className="px-6 py-2.5 bg-[#A8A5FF] hover:bg-[#9693ff] text-black font-medium rounded-lg text-sm transition-colors cursor-pointer">
                            Browse libraries
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col relative bg-white dark:bg-zinc-800">
                    <div className="flex-1 p-4 space-y-6 select-none overflow-hidden pointer-events-none flex flex-col justify-center">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] text-gray-500 dark:text-zinc-400 font-medium overflow-hidden">
                                    <img src="https://nulldrop.xyz/share/cmjqiw7v300d8kqedu32u7k9g" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">!̸I̸m̸p̸u̸l̸s̸e̸  • 1 hour ago</span>
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm pl-8">Should we align this to the grid?</p>
                        </div>
                        <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-gray-100 dark:border-zinc-700/50">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-medium">K</div>
                                <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">John • 2 hours ago</span>
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm pl-8">Love the new dark mode scheme!</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[10px] text-purple-600 dark:text-purple-400 font-medium">M</div>
                                <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium">Mike • 1 day ago</span>
                            </div>
                            <p className="text-gray-500 dark:text-zinc-400 text-sm pl-8">Can you make it smaller?</p>
                        </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-800 dark:via-zinc-800/40 dark:to-transparent">
                        <div className="text-center px-6">
                            <h3 className="text-gray-900 dark:text-zinc-200 font-semibold mb-2">Enable Collaboration</h3>
                            <button className="mt-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
                                Buy License
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'presentation' && (
                <div className="flex-1 flex flex-col relative bg-white dark:bg-zinc-800">
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Slides</h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                {elements.filter(e => e.type === 'frame').length} frames found
                            </p>
                        </div>

                        {elements.filter(e => e.type === 'frame').map((frame, index) => (
                            <button
                                key={frame.id}
                                onClick={() => onSelectElement(frame.id)}
                                className="w-full text-left group relative bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-700/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-xl p-3 transition-all duration-200 hover:shadow-md cursor-pointer flex gap-3"
                            >
                                <div className="shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800 text-[10px] font-mono flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                                        {frame.name || `Frame ${index + 1}`}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                                        Slide
                                    </p>
                                </div>
                            </button>
                        ))}

                        {elements.filter(e => e.type === 'frame').length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <Presentation className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No frames found</p>
                                <p className="text-xs mt-2">Add frames to create slides</p>
                            </div>
                        )}

                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                        <button className="w-full py-2.5 bg-[#0a0a0a] dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer">
                            <Play size={16} className="fill-current" />
                            Start Presentation
                        </button>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-zinc-800 dark:via-zinc-800/40 dark:to-transparent z-10">
                        <div className="text-center px-6">
                            <h3 className="text-gray-900 dark:text-zinc-200 font-semibold mb-2">Enable Presentation Mode</h3>
                            <button className="mt-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
                                Buy License
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}