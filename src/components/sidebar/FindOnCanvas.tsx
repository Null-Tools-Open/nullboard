'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Search, ChevronDown, Monitor, Clock, Cloud, Layout, MousePointer2, Type, Database, CheckSquare, Settings as SettingsIcon, Package, MoreVertical, Flag, Trash2, Crown, Maximize2, Minimize2, X, BookOpen, MessageSquare, Presentation, Square, Circle, Diamond, Minus, ArrowRight, ImageIcon, Box, PenTool, Link, Pin, Play, Plus, Film, Headphones, Mic, Smile } from 'lucide-react'
import { CanvasElement } from '../canvas/shared'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { saveAsset } from '@/lib/assetStore'
import { mediaPayload } from '@/lib/chatClient'
import EmojiPicker, { Theme } from 'emoji-picker-react'

interface FindOnCanvasProps {
    isOpen: boolean
    onClose: () => void
    elements: CanvasElement[]
    onSelectElement: (elementId: string) => void
    chatMessages?: any[]
    onSendMessage?: (content: string, media?: mediaPayload) => void
    onDeleteMessage?: (messageId: string) => void
    connectionStatus?: 'connected' | 'connecting' | 'disconnected'
    currentClientId?: string
    isHost?: boolean
    initialTab?: 'search' | 'library' | 'chat' | 'presentation'
}

const Comments = []

export function FindOnCanvas({
    isOpen,
    onClose,
    elements,
    onSelectElement,
    chatMessages = [],
    onSendMessage,
    onDeleteMessage,
    connectionStatus = 'disconnected',
    currentClientId,
    isHost = false,
    initialTab = 'search'
}: FindOnCanvasProps) {
    const [query, setQuery] = useState('')
    const [chatInput, setChatInput] = useState('')
    const [activeTab, setActiveTab] = useState<'search' | 'library' | 'chat' | 'presentation'>(initialTab)
    const [isPinned, setIsPinned] = useState(false)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false)
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState<mediaPayload | null>(null)
    const [isUploadingMedia, setIsUploadingMedia] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const mediaInputRef = useRef<HTMLInputElement>(null)
    const attachMenuRef = useRef<HTMLDivElement>(null)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'))

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'))
                }
            })
        })

        observer.observe(document.documentElement, { attributes: true })
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (activeTab === 'chat' && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatMessages, activeTab])

    const [reportingMessage, setReportingMessage] = useState<any>(null)
    const [reportReason, setReportReason] = useState('Spam / Advertising')
    const [reportDetails, setReportDetails] = useState('')
    const [isSubmittingReport, setIsSubmittingReport] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab)
        }
    }, [isOpen, initialTab])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (attachMenuRef.current && !attachMenuRef.current.contains(target)) {
                setIsAttachMenuOpen(false);
            }
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
                setIsEmojiPickerOpen(false);
            }
            if (openMenuId && !target.closest('.message-action-menu')) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openMenuId])

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

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

        if (file.size > MAX_FILE_SIZE) {
            toast.error("File is too large. Maximum size is 10MB.", { id: 'media-upload' });
            if (mediaInputRef.current) mediaInputRef.current.value = '';
            return;
        }

        try {
            setIsUploadingMedia(true)

            const assetId = await saveAsset(file)

            const reader = new FileReader()
            reader.onload = (event) => {
                const src = event.target?.result as string

                let mediaType: 'image' | 'video' | 'audio' = 'image'
                if (file.type.startsWith('video/')) mediaType = 'video'
                else if (file.type.startsWith('audio/')) mediaType = 'audio'

                setSelectedMedia({
                    type: mediaType,
                    url: src
                })
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error('Failed to upload media:', error)
            toast.error('Failed to upload media')
        } finally {
            setIsUploadingMedia(false)
            if (mediaInputRef.current) mediaInputRef.current.value = ''
        }
    }

    const handleAudioComplete = async (audioBlob: Blob) => {
        if (!audioBlob || audioBlob.size === 0) return;

        try {
            setIsUploadingMedia(true);
            const mimeType = audioBlob.type || 'audio/webm';
            const file = new File([audioBlob], `voice-message.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`, { type: mimeType });
            const reader = new FileReader();

            reader.onload = (event) => {
                const src = event.target?.result as string;
                if (onSendMessage) {
                    onSendMessage('', { type: 'audio', url: src });
                } else {
                    setSelectedMedia({ type: 'audio', url: src });
                }
                setIsAttachMenuOpen(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Failed to process voice recording:', error);
            toast.error('Failed to process voice message');
        } finally {
            setIsUploadingMedia(false);
            setIsRecording(false);
        }
    };

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
                <div className="flex-1 flex flex-col relative bg-white dark:bg-zinc-800 min-h-0">
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto flex flex-col pt-6 min-h-0">
                        {chatMessages.length === 0 ? (
                            <div className="text-center text-gray-500 dark:text-zinc-400 text-sm mt-8 opacity-60">
                                No messages yet. Be the first to say hi!
                            </div>
                        ) : (
                            chatMessages.map((msg, idx) => {

                                const canDelete = !msg.deleted && (isHost || msg.clientId === currentClientId);
                                const prevMsg = idx > 0 ? chatMessages[idx - 1] : null;
                                const isGrouped = prevMsg &&
                                    prevMsg.clientId === msg.clientId &&
                                    Math.floor((msg.timestamp || 0) / 60000) === Math.floor((prevMsg.timestamp || 0) / 60000);
                                const messageKey = msg.id || `msg-${idx}`;

                                return (
                                    <div key={messageKey} className={`flex flex-col group/msg min-w-0 ${msg.deleted ? 'opacity-60 grayscale' : ''} ${msg.failed ? 'opacity-70' : ''} ${isGrouped ? 'mt-0.5' : 'mt-4'}`} style={{
                                        borderLeft: `2px solid ${msg.failed ? '#ef4444' : (msg.color || 'transparent')}`,
                                        paddingLeft: '0.75rem'
                                    }}>
                                        {!isGrouped && (
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-semibold" style={{ color: msg.color || '#A8A5FF' }}>
                                                        {msg.name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium tracking-wide">
                                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col items-start relative w-full min-w-0">
                                            <div className="flex items-start justify-between relative w-full min-w-0">
                                                <div className="flex flex-col gap-1 w-full min-w-0 pr-6">
                                                    <p className={`text-[14px] leading-relaxed break-words break-all py-0.5 min-w-0 w-full ${msg.deleted ? 'text-gray-400 dark:text-zinc-500 italic' : (msg.failed ? 'text-red-400/80 dark:text-red-400/80' : 'text-gray-800 dark:text-zinc-300')}`}>
                                                        {msg.deleted ? 'This message was deleted.' : msg.content}
                                                    </p>
                                                    {msg.media && !msg.deleted && (
                                                        <div className="mt-1 rounded-lg overflow-hidden max-w-full bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                                                            {msg.media.type === 'image' && (
                                                                <img src={msg.media.url} alt="Media" className="max-w-full object-contain max-h-48" />
                                                            )}
                                                            {msg.media.type === 'video' && (
                                                                <video src={msg.media.url} controls className="max-w-full max-h-48" />
                                                            )}
                                                            {msg.media.type === 'audio' && (
                                                                <audio src={msg.media.url} controls className="max-w-full mt-1" />
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.reaction && !msg.deleted && (
                                                        <div className="flex gap-1 mt-1">
                                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-full text-xs font-medium text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                                                                <span>{msg.reaction.character}</span>
                                                                {msg.reaction.amount > 1 && <span className="text-[10px] ml-0.5">{msg.reaction.amount}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {(!msg.deleted && !msg.failed) && (
                                                    <div className={`absolute right-0 top-0 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 transition-opacity message-action-menu ${openMenuId === messageKey ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'}`}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setOpenMenuId(openMenuId === messageKey ? null : messageKey)
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                                                        >
                                                            <MoreVertical size={14} />
                                                        </button>

                                                        {openMenuId === messageKey && (
                                                            <div className="absolute right-0 top-full mt-1 z-50 w-32 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                                                {canDelete && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (onDeleteMessage && msg.id) onDeleteMessage(msg.id)
                                                                            setOpenMenuId(null)
                                                                        }}
                                                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        <span>Delete</span>
                                                                    </button>
                                                                )}
                                                                {msg.clientId !== currentClientId && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenMenuId(null)
                                                                            setReportingMessage(msg)
                                                                            setReportReason('Spam / Advertising')
                                                                            setReportDetails('')
                                                                        }}
                                                                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                                                                    >
                                                                        <Flag size={14} />
                                                                        <span>Report</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {msg.failed && (
                                                <p className="text-[10px] text-red-500/80 font-medium mt-0.5">
                                                    Your message could not be delivered. You are sending messages too quickly.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {connectionStatus === 'connected' ? (
                        <div className="p-3 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col gap-2">
                            {selectedMedia && (
                                <div className="relative inline-block self-start ml-1 mt-1">
                                    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 max-w-[150px] max-h-[150px]">
                                        {selectedMedia.type === 'image' && (
                                            <img src={selectedMedia.url} alt="Attachment Preview" className="max-w-[150px] max-h-[150px] object-cover" />
                                        )}
                                        {selectedMedia.type === 'video' && (
                                            <video src={selectedMedia.url} className="max-w-[150px] max-h-[150px] object-cover" />
                                        )}
                                        {selectedMedia.type === 'audio' && (
                                            <div className="p-4 flex items-center justify-center text-gray-500">
                                                <Headphones size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedMedia(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                                    >
                                        <X size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                            <div className="relative flex items-center bg-gray-100 dark:bg-zinc-900/50 rounded-lg p-1 border border-transparent focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
                                {!isRecording && (
                                    <div className="relative group" ref={attachMenuRef}>
                                        <button
                                            type="button"
                                            disabled={isUploadingMedia}
                                            onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <Plus size={18} className={cn(isUploadingMedia && "animate-spin")} />
                                        </button>

                                        {isAttachMenuOpen && (
                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700/50 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                                                <div className="p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsAttachMenuOpen(false)
                                                            mediaInputRef.current?.click()
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Box size={16} className="text-[#A8A5FF]" />
                                                        <span className="font-medium">Attach Media</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsAttachMenuOpen(false)
                                                            // startRecording()
                                                        }}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700/50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Mic size={16} className="text-[#A8A5FF]" />
                                                        <span className="font-medium">Record Voice Message</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={mediaInputRef}
                                    className="hidden"
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    onChange={handleMediaUpload}
                                />
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        if (isRecording) return;
                                        if ((chatInput.trim() || selectedMedia) && onSendMessage) {
                                            onSendMessage(chatInput.trim(), selectedMedia || undefined)
                                            setChatInput('')
                                            setSelectedMedia(null)
                                        }
                                    }}
                                    className="flex-1 relative flex items-center"
                                >
                                    {isRecording ? (
                                        <div className="flex-1 flex items-center justify-between px-2 w-full animate-in fade-in slide-in-from-right-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-red-500 font-mono text-sm">
                                                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                // onClick={cancelRecording}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Cancel Recording"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            maxLength={300}
                                            placeholder="Type a message..."
                                            className="w-full bg-transparent text-gray-900 dark:text-zinc-100 text-sm pl-2 pr-14 py-1.5 outline-none placeholder:text-gray-500"
                                        />
                                    )}
                                    <div className="absolute right-1 flex items-center gap-1">
                                        {!isRecording && (
                                            <div className="relative flex items-center" ref={emojiPickerRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                                                >
                                                    <Smile size={18} />
                                                </button>
                                                {isEmojiPickerOpen && (
                                                    <div className="absolute bottom-full right-0 mb-2 z-50 shadow-xl overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
                                                        <EmojiPicker
                                                            theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                                                            onEmojiClick={(emoji) => {
                                                                setChatInput(prev => prev + emoji.emoji)
                                                            }}
                                                            lazyLoadEmojis={true}
                                                            searchDisabled={true}
                                                            skinTonesDisabled={true}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {isRecording && (
                                            <button
                                                type="button"
                                                // onClick={stopRecording}
                                                className="text-white bg-red-500 hover:bg-red-600 rounded-full cursor-pointer p-1 shadow-md transition-colors animate-pulse"
                                                title="Send Voice Message"
                                            >
                                                <Square size={14} fill="currentColor" className="m-[2px]" />
                                            </button>
                                        )}
                                        {(!isRecording && (chatInput.trim() || selectedMedia)) && (
                                            <button
                                                type="submit"
                                                disabled={(!chatInput.trim() && !selectedMedia) || isUploadingMedia}
                                                className="text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-blue-500 cursor-pointer p-1"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 text-center px-2 mb-1">
                                Messages are cleared after the session. Upgrade to <strong>Premium</strong> to save chat history.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center">
                            <p className="text-sm text-gray-500 dark:text-zinc-400">
                                You must be connected to a session to chat.
                            </p>
                        </div>
                    )}
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
                                Get License
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {reportingMessage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-200 dark:border-zinc-800/80">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800/80 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                                <Flag size={16} className="text-yellow-500" /> Report Message
                            </h3>
                            <button onClick={() => setReportingMessage(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="text-sm bg-gray-50 dark:bg-[#0a0a0a] p-3 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                                <p className="font-semibold text-gray-700 dark:text-zinc-300 mb-1">{reportingMessage.name}</p>
                                <p className="text-gray-500 dark:text-zinc-400 italic line-clamp-3">"{reportingMessage.content}"</p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Reason</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-zinc-800/80 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-gray-300 dark:focus:border-zinc-700 transition-colors cursor-pointer"
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                    >
                                        <option value="Spam / Advertising">Spam / Advertising</option>
                                        <option value="Harassment / Toxicity">Harassment / Toxicity</option>
                                        <option value="Inappropriate Content">Inappropriate Content</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Additional Details (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-zinc-800/80 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 outline-none focus:border-gray-300 dark:focus:border-zinc-700 transition-colors resize-none h-20 placeholder:text-zinc-500"
                                    placeholder="Provide more context..."
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 dark:bg-[#18181b] border-t border-gray-100 dark:border-zinc-800/80 flex justify-end gap-2">
                            <button
                                onClick={() => setReportingMessage(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 cursor-pointer rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800/80 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSubmittingReport}
                                onClick={async () => {
                                    setIsSubmittingReport(true)
                                    const { reportChatMessage } = await import('@/lib/chatClient')
                                    const finalReason = reportDetails.trim() ? `${reportReason} - ${reportDetails}` : reportReason;
                                    const success = await reportChatMessage({
                                        roomId: encodeURIComponent(window.location.pathname.split('/').pop() || 'unknown'),
                                        messageId: reportingMessage.id,
                                        messageContent: reportingMessage.content,
                                        reason: finalReason,
                                        reporterId: currentClientId,
                                        reporterName: 'Reporter (Client)',
                                        reportedUserId: reportingMessage.clientId,
                                        reportedUserName: reportingMessage.name
                                    })
                                    setIsSubmittingReport(false)
                                    setReportingMessage(null)
                                    if (success) {
                                        toast.success('Message reported successfully', {
                                            style: {
                                                background: '#18181b',
                                                color: '#fff',
                                                border: '1px solid #27272a'
                                            }
                                        })
                                    } else {
                                        toast.error('Failed to report message', {
                                            style: {
                                                background: '#18181b',
                                                color: '#fff',
                                                border: '1px solid #27272a'
                                            }
                                        })
                                    }
                                }}
                                className="px-4 py-2 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer border border-red-500/20"
                            >
                                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}