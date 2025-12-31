import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Download,
    Image as ImageIcon,
    Trash2,
    Moon,
    Sun,
    LayoutTemplate,
    FolderOpen,
    FolderKanban,
    HelpCircle,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface CommandAction {
    id: string
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    shortcut?: string
    section: 'App' | 'Export' | 'Editor' | 'Tools'
    perform: () => void
    keywords?: string[]
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    actions: {
        onSaveAs?: () => void
        onExportImage?: () => void
        onClearWorkspace?: () => void
        onOpen?: () => void
        onToggleTheme?: () => void
        onLayoutEditToggle?: () => void
        onWorkspaces?: () => void
        onHelp?: () => void
        onFindCanvas?: () => void
        onRealTimeColab?: () => void
    }
}

export function CommandPalette({ isOpen, onClose, actions }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const { theme, setTheme, resolvedTheme } = useTheme()

    const commands: CommandAction[] = useMemo(() => [
        {
            id: 'open',
            label: 'Open',
            icon: FolderOpen,
            shortcut: 'Ctrl+O',
            section: 'App',
            perform: () => actions.onOpen?.()
        },
        {
            id: 'workspaces',
            label: 'Workspaces',
            icon: FolderKanban,
            section: 'App',
            perform: () => actions.onWorkspaces?.()
        },
        {
            id: 'real-time-colab',
            label: 'Real-time collaboration',
            icon: Users,
            section: 'App',
            perform: () => actions.onRealTimeColab?.()
        },
        {
            id: 'toggle-theme',
            label: 'Toggle theme',
            icon: resolvedTheme === 'dark' ? Sun : Moon,
            section: 'App',
            perform: () => {
                actions.onToggleTheme?.() || setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
        },
        {
            id: 'edit-layout',
            label: 'Edit Interface Layout',
            icon: LayoutTemplate,
            section: 'App',
            perform: () => actions.onLayoutEditToggle?.()
        },
        {
            id: 'help',
            label: 'Help',
            icon: HelpCircle,
            shortcut: '?',
            section: 'App',
            perform: () => actions.onHelp?.()
        },
        {
            id: 'find-canvas',
            label: 'Find on Canvas',
            icon: Search,
            shortcut: 'Ctrl+F',
            section: 'App',
            perform: () => actions.onFindCanvas?.()
        },
        {
            id: 'save-as',
            label: 'Save as...',
            icon: Download,
            section: 'Export',
            perform: () => actions.onSaveAs?.()
        },
        {
            id: 'export-image',
            label: 'Export image...',
            icon: ImageIcon,
            shortcut: 'Ctrl+Shift+E',
            section: 'Export',
            perform: () => actions.onExportImage?.()
        },
        {
            id: 'clear-workspace',
            label: 'Clear Workspace',
            icon: Trash2,
            section: 'Editor',
            perform: () => actions.onClearWorkspace?.()
        }
    ], [actions, resolvedTheme, setTheme])

    const filteredCommands = useMemo(() => {
        if (!query) return commands
        const lowerQuery = query.toLowerCase()
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.section.toLowerCase().includes(lowerQuery)
        )
    }, [query, commands])

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 10)
        }
    }, [isOpen])

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault()
                e.stopPropagation()
                return
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].perform()
                    onClose()
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown, true)
        return () => window.removeEventListener('keydown', handleKeyDown, true)
    }, [isOpen, filteredCommands, selectedIndex, onClose])

    useEffect(() => {
        if (listRef.current) {
            const activeElement = listRef.current.children[selectedIndex] as HTMLElement
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [selectedIndex])

    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandAction[]> = {}
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.section]) groups[cmd.section] = []
            groups[cmd.section].push(cmd)
        })
        return groups
    }, [filteredCommands])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
                    >
                        <div className="bg-white dark:bg-[#232329] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden flex flex-col max-h-[60vh]">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700/50 flex items-center gap-3">
                                <Search className="text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type a command or search..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            inputRef.current?.select()
                                        }
                                    }}
                                    className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 flex-1 text-base"
                                />
                                <div className="flex gap-2">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700">ESC</span>
                                </div>
                            </div>

                            <div className="overflow-y-auto p-2" ref={listRef}>
                                {filteredCommands.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-500 text-sm">No commands found</div>
                                ) : (
                                    Object.entries(groupedCommands).map(([section, items]) => (
                                        <div key={section} className="mb-2">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                                                {section}
                                            </div>
                                            {items.map(cmd => {
                                                const index = filteredCommands.indexOf(cmd)
                                                const isSelected = index === selectedIndex

                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => {
                                                            cmd.perform()
                                                            onClose()
                                                        }}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                                                            isSelected
                                                                ? "bg-blue-100 dark:bg-blue-600/20 text-blue-900 dark:text-blue-100"
                                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        )}
                                                    >
                                                        <cmd.icon size={18} className={cn(isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500")} />
                                                        <span className="flex-1 font-medium">{cmd.label}</span>
                                                        {cmd.shortcut && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-700/50">
                                                                {cmd.shortcut}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-[#1e1e24] p-2 border-t border-gray-200 dark:border-gray-700/50 flex items-center justify-end gap-4 text-[10px] text-gray-500 dark:text-gray-500 px-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">↑↓</span>
                                    <span>to navigate</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">↵</span>
                                    <span>to select</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}