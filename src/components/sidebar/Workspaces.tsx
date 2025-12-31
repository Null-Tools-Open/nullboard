'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Folder, Search, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo, useEffect } from 'react'
import type { Workspace } from '@/hooks/useWorkspaces'
import { WorkspaceDeletePrompt } from '@/components/prompts/workspaceDelete'

interface WorkspacesSidebarProps {
    isOpen: boolean
    onClose: () => void
    workspaces: Workspace[]
    activeWorkspaceId: string
    onCreateWorkspace: (name: string) => void
    onDeleteWorkspace: (id: string) => void
    onSwitchWorkspace: (id: string) => void
}

export function WorkspacesSidebar({
    isOpen,
    onClose,
    workspaces,
    activeWorkspaceId,
    onCreateWorkspace,
    onDeleteWorkspace,
    onSwitchWorkspace

}: WorkspacesSidebarProps) {

    const [newWorkspaceName, setNewWorkspaceName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isCreating) {
                e.preventDefault()
                onClose()
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, isCreating])

    const filteredWorkspaces = useMemo(() => {

        if (!searchQuery) return workspaces

        return workspaces.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))

    }, [workspaces, searchQuery])

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (newWorkspaceName.trim()) {
            onCreateWorkspace(newWorkspaceName.trim())
            setNewWorkspaceName('')
            setIsCreating(false)
        }
    }

    const handleDeleteConfirm = () => {
        if (deletingWorkspaceId) {
            onDeleteWorkspace(deletingWorkspaceId)
            setDeletingWorkspaceId(null)
        }
    }

    return (
        <>
            <WorkspaceDeletePrompt
                isOpen={!!deletingWorkspaceId}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeletingWorkspaceId(null)}
            />
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 z-[71] shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-zinc-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-gray-500 dark:text-zinc-100" />
                                    Workspaces
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4 pb-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search workspaces..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-100 dark:bg-zinc-900/50 text-gray-900 dark:text-zinc-100 text-sm rounded-lg pl-9 pr-4 py-2.5 border border-transparent focus:border-gray-400 dark:focus:border-zinc-500 outline-none placeholder:text-gray-500 dark:placeholder:text-zinc-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                                {filteredWorkspaces.length === 0 && (
                                    <div className="text-center text-gray-500 dark:text-zinc-400 text-sm mt-8 opacity-70">
                                        No workspaces found
                                    </div>
                                )}

                                {filteredWorkspaces.map((workspace) => (
                                    <div
                                        key={workspace.id}
                                        onClick={() => onSwitchWorkspace(workspace.id)}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden",
                                            activeWorkspaceId === workspace.id
                                                ? "bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700"
                                                : "bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-700/30"
                                        )}
                                    >
                                        {activeWorkspaceId === workspace.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900 dark:bg-zinc-100 rounded-l-lg" />
                                        )}

                                        <div className="flex items-center gap-3 min-w-0 pl-1">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                activeWorkspaceId === workspace.id
                                                    ? "text-gray-900 dark:text-zinc-100 bg-transparent"
                                                    : "text-gray-500 dark:text-zinc-400 group-hover:bg-white dark:group-hover:bg-zinc-600"
                                            )}>
                                                <Folder size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className={cn(
                                                    "font-medium truncate text-sm transition-colors",
                                                    activeWorkspaceId === workspace.id
                                                        ? "text-gray-900 dark:text-zinc-100 font-semibold"
                                                        : "text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-zinc-100"
                                                )}>
                                                    {workspace.name}
                                                </span>
                                                <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                                    Edited {new Date(workspace.lastModified).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {workspace.id !== 'default' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeletingWorkspaceId(workspace.id)
                                                    }}
                                                    disabled={workspaces.length <= 1}
                                                    className={cn(
                                                        "p-2 rounded-md transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 cursor-pointer",
                                                        workspaces.length <= 1
                                                            ? "cursor-not-allowed opacity-0"
                                                            : "hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                                                    )}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900/30">
                                {isCreating ? (
                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onSubmit={handleCreate}
                                        className="space-y-3"
                                    >
                                        <input
                                            type="text"
                                            value={newWorkspaceName}
                                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                                            placeholder="Workspace Name"
                                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-zinc-500 placeholder:text-gray-500 dark:placeholder:text-zinc-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
                                            >
                                                Create
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsCreating(false)}
                                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                Cancel  
                                            </button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 px-4 py-3 rounded-xl transition-all shadow-sm hover:shadow-md group cursor-pointer"
                                    >
                                        <div className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 group-hover:bg-black dark:group-hover:bg-white p-1 rounded-md transition-colors shadow-sm">
                                            <Plus size={18} />
                                        </div>
                                        <span className="font-medium">New Workspace</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}