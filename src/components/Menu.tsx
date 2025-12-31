'use client'

import { useTheme } from '@/hooks/useTheme'

import { useState, useRef, useEffect } from 'react'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu as MenuIcon,
  FolderOpen,
  Download,
  Image as ImageIcon,
  Users,
  Zap,
  Search,
  HelpCircle,
  Trash2,
  Github,
  X as XIcon,
  LogIn,
  Sun,
  Moon,
  Monitor,
  LayoutTemplate,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { DiscordIcon } from './icons/pack'
import { CommandPalette } from './prompts/commandPalette'
import { HelpDialog } from './prompts/HelpDialog'
import { WorkspaceClearPrompt } from './prompts/workspaceClear'
import { RealTimeColabPrompt } from './prompts/realTimeColab'
import { UserSettingsPrompt } from './prompts/userSettings'
import { type MenuPosition, type ToolbarPosition } from '@/hooks/useUIPosition'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface MenuItem {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  shortcut?: string
  onClick?: () => void
  highlight?: boolean
  href?: string
  external?: boolean
}

interface MenuSection {
  items: MenuItem[]
}

interface MenuProps {
  onDocumentThemeChange?: (theme: 'light' | 'dark') => void
  onClearWorkspace?: () => void
  onSaveAs?: () => void
  onExportImage?: () => void
  onOpen?: () => void
  onTestWorkspace?: () => void
  position?: MenuPosition
  toolbarPosition?: ToolbarPosition
  onMenuPositionChange?: (pos: MenuPosition) => void
  onToolbarPositionChange?: (pos: ToolbarPosition) => void
  isLayoutEditing?: boolean
  onLayoutEditToggle?: () => void
  onDragPreview?: (pos: MenuPosition | null) => void
  onFindCanvas?: () => void
  elementCount?: number
  onWorkspaces?: () => void
  onRealTimeColab?: () => void
}

export function Menu({
  onClearWorkspace,
  onSaveAs,
  onExportImage,
  onOpen,
  onTestWorkspace,
  position = 'top-left',
  onMenuPositionChange,
  isLayoutEditing = false,
  onLayoutEditToggle,
  onDragPreview,
  onFindCanvas,
  elementCount = 0,
  onWorkspaces,
  onRealTimeColab
}: MenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme, resolvedTheme, canvasColor, setCanvasColor } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth()

  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [snapKey, setSnapKey] = useState(0)
  const [showRealTimeColab, setShowRealTimeColab] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastPreviewRef = useRef<MenuPosition | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === 'k')) {
        e.preventDefault()
        e.stopPropagation()
        setShowCommandPalette(prev => !prev)
        return
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault()
          e.stopPropagation()
          setShowHelp(true)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen])

  const handleOpen = () => {
    if (onOpen) {
      onOpen()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleSaveAs = () => {
    if (onSaveAs) {
      onSaveAs()
    } else {
      const data = JSON.stringify({ elements: [], timestamp: Date.now() }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `canvas-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage()
    }
  }

  const handleClearWorkspace = () => {
    setShowClearConfirm(true)
  }

  const confirmClearWorkspace = () => {
    if (onClearWorkspace) {
      onClearWorkspace()
    }
    setShowClearConfirm(false)
    setIsOpen(false)
  }

  const handleTestWorkspace = () => {
    if (onTestWorkspace) {
      onTestWorkspace()
    }
    setIsOpen(false)
  }

  const menuSections: MenuSection[] = [
    {
      items: [
        { label: 'Open', icon: FolderOpen, shortcut: 'Ctrl+O', onClick: handleOpen },
        { label: 'Save as...', icon: Download, onClick: handleSaveAs },
        { label: 'Export image...', icon: ImageIcon, shortcut: 'Ctrl+Shift+E', onClick: handleExportImage },
        { label: 'Test Workspace', icon: Zap, onClick: handleTestWorkspace },
        { label: 'Real-time collaboration...', icon: Users, onClick: () => { setIsOpen(false); setShowRealTimeColab(true) } },
        { label: 'Command Palette', icon: Zap, shortcut: 'Ctrl+/', highlight: true, onClick: () => { setIsOpen(false); setShowCommandPalette(true) } },
        { label: 'Find on canvas', icon: Search, shortcut: 'Ctrl+F', onClick: () => { setIsOpen(false); onFindCanvas?.() } },
        { label: 'Workspaces', icon: FolderOpen, onClick: () => { setIsOpen(false); onWorkspaces?.() } },
        { label: 'Help', icon: HelpCircle, shortcut: '?', onClick: () => { setIsOpen(false); setShowHelp(true) } },
        { label: 'Edit Interface Layout', icon: LayoutTemplate, onClick: () => { setIsOpen(false); onLayoutEditToggle?.() } },
        { label: 'Clear Workspace', icon: Trash2, onClick: handleClearWorkspace },
      ]
    },
    {
      items: [
        { label: 'GitHub', icon: Github, href: 'https://github.com/Null-Tools-Open', external: true },
        { label: 'Follow us', icon: XIcon, href: 'https://x.com/NullToolsXYZ', external: true },
        { label: 'Discord', icon: DiscordIcon, href: 'https://discord.gg/7WMZh7jjEB', external: true },
        ...(user ? [
          {
            label: user.name || user.email,
            icon: ({ className }: { size?: number; className?: string }) => {
              const [imgError, setImgError] = useState(false)
              const avatarSize = 24

              if (user.avatar && !imgError) {
                return (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className={cn("rounded-full object-cover bg-gray-200 dark:bg-zinc-700", className)}
                    style={{ width: avatarSize, height: avatarSize }}
                    onError={() => setImgError(true)}
                  />
                )
              }

              return <User size={avatarSize} className={className} />
            },
            onClick: () => {
              setIsOpen(false)
              setShowUserSettings(true)
            }
          },
          {
            label: 'Sign out',
            icon: LogOut,
            onClick: async () => {
              setIsOpen(false)
              await logout()
              router.push('/login')
            }
          }
        ] : [
          { label: 'Sign in', icon: LogIn, highlight: true, onClick: () => { setIsOpen(false); router.push('/login') } },
        ])
      ]
    }
  ]

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'fixed top-4 right-4'
      case 'bottom-left': return 'fixed bottom-4 left-4'
      case 'bottom-right': return 'fixed bottom-4 right-4'
      case 'top-left':
      default: return 'fixed top-4 left-4'
    }
  }

  const getDropdownClasses = () => {
    const isBottom = position.startsWith('bottom')
    const isRight = position.endsWith('right')

    return cn(
      'absolute w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 overflow-hidden z-50',
      isBottom ? 'bottom-12' : 'top-12',
      isRight ? 'right-0' : 'left-0'
    )
  }

  const getOrigin = () => {
    if (position === 'top-left') return 'top left'
    if (position === 'top-right') return 'top right'
    if (position === 'bottom-left') return 'bottom left'
    if (position === 'bottom-right') return 'bottom right'
    return 'top left'
  }

  return (
    <motion.div
      key={`${position}-${snapKey}`}
      className={`${getPositionClasses()} z-[70]`}
      drag={isLayoutEditing}
      dragMomentum={false}
      dragElastic={0}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', opacity: 0.8 }}
      onDrag={(_, info) => {
        if (!onDragPreview) return

        const { x, y } = info.point
        const width = window.innerWidth
        const height = window.innerHeight

        const isLeft = x < width / 2
        const isTop = y < height / 2

        let newPos: MenuPosition = 'top-left'
        if (isTop && isLeft) newPos = 'top-left'
        else if (isTop && !isLeft) newPos = 'top-right'
        else if (!isTop && isLeft) newPos = 'bottom-left'
        else if (!isTop && !isLeft) newPos = 'bottom-right'

        if (lastPreviewRef.current !== newPos) {
          lastPreviewRef.current = newPos
          onDragPreview(newPos)
        }
      }}
      onDragEnd={(_, info) => {
        lastPreviewRef.current = null
        onDragPreview?.(null)
        if (!onMenuPositionChange) return

        const { x, y } = info.point
        const width = window.innerWidth
        const height = window.innerHeight
        const isLeft = x < width / 2
        const isTop = y < height / 2

        let newPos: MenuPosition = 'top-left'
        if (isTop && isLeft) newPos = 'top-left'
        else if (isTop && !isLeft) newPos = 'top-right'
        else if (!isTop && isLeft) newPos = 'bottom-left'
        else if (!isTop && !isLeft) newPos = 'bottom-right'

        if (newPos === position) {
          setSnapKey(prev => prev + 1)
        } else {
          onMenuPositionChange(newPos)
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && onOpen) {
            const reader = new FileReader()
            reader.onload = (event) => {
              try {
                const data = JSON.parse(event.target?.result as string)
              } catch (error) {
                console.error('Error loading file:', error)
              }
            }
            reader.readAsText(file)
          }
        }}
      />

      <button
        onClick={() => {
          if (!isLayoutEditing) {
            setIsOpen(!isOpen)
          }
        }}
        className={cn(
          "w-10 h-10 rounded-lg bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 shadow-lg flex items-center justify-center transition-all relative z-[61]",
          isLayoutEditing ? "cursor-grab active:cursor-grabbing ring-2 ring-blue-500 scale-110" : "hover:bg-gray-50 dark:hover:bg-zinc-700/50 cursor-pointer"
        )}
      >
        <MenuIcon size={20} className="text-gray-700 dark:text-zinc-200" />
      </button>

      {isLayoutEditing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse z-[62]" />
      )}

      <AnimatePresence>
        {isOpen && !isLayoutEditing && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: getOrigin() }}
              className={getDropdownClasses()}
            >
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                {menuSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="py-2">
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon
                        const isLink = item.href && item.external

                        const content = (
                          <>
                            <Icon size={18} className={cn('text-gray-700 dark:text-zinc-400 flex-shrink-0', item.highlight && 'text-blue-600 dark:text-blue-400')} />
                            <span className={cn('flex-1 text-sm font-medium text-gray-900 dark:text-zinc-200', item.highlight && 'text-blue-600 dark:text-blue-400')}>{item.label}</span>
                            {item.shortcut && (
                              <KbdGroup>
                                {item.shortcut.split('+').map((key, idx, arr) => (
                                  <React.Fragment key={idx}>
                                    <Kbd>{key.trim()}</Kbd>
                                    {idx < arr.length - 1 && <span className="text-gray-400 mx-0.5">+</span>}
                                  </React.Fragment>
                                ))}
                              </KbdGroup>
                            )}
                          </>
                        )

                        if (isLink) {
                          return (
                            <a
                              key={itemIndex}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                if (item.label !== 'Command Palette' && item.label !== 'Sign up' && item.label !== 'Sign in') {
                                  setIsOpen(false)
                                }
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer',
                                item.highlight && 'text-blue-600 dark:text-blue-400'
                              )}
                            >
                              {content}
                            </a>
                          )
                        }

                        return (
                          <button
                            key={itemIndex}
                            onClick={() => {
                              item.onClick?.()
                              if (item.label !== 'Command Palette' && item.label !== 'Sign up' && item.label !== 'Sign in') {
                                setIsOpen(false)
                              }
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer',
                              item.highlight && 'text-blue-600 dark:text-blue-400'
                            )}
                          >
                            {content}
                          </button>
                        )
                      })}
                    </div>
                    {sectionIndex < menuSections.length - 1 && (
                      <div className="border-t border-gray-200 dark:border-zinc-700 my-2" />
                    )}
                  </div>
                ))}

                <div className="border-t border-gray-200 dark:border-zinc-700 my-2" />

                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="text-xs font-medium text-gray-500 dark:text-zinc-500">Theme</div>
                  <div className="flex items-center p-0.5 bg-gray-100 dark:bg-zinc-900/50 rounded-md border border-gray-200 dark:border-zinc-700/50">
                    {[
                      { id: 'light', icon: Sun, label: 'Light' },
                      { id: 'dark', icon: Moon, label: 'Dark' },
                      { id: 'system', icon: Monitor, label: 'System' }
                    ].map((t) => {
                      const ThemeIcon = t.icon
                      const isSelected = theme === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as typeof theme)}
                          className={cn(
                            'w-8 h-7 rounded flex items-center justify-center transition-all cursor-pointer relative',
                            isSelected
                              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                              : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                          )}
                          title={t.label}
                        >
                          <ThemeIcon size={14} strokeWidth={2.5} />
                        </button>
                      )
                    })}
                  </div>
                </div>



                <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-zinc-500 mb-2">Document Theme</div>
                  <div className="space-y-2">
                    {resolvedTheme === 'light' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['#ffffff', '#f8fafc', '#fdfbf7', '#f0f9ff', '#fdf2f8'].map((color) => {
                          const isSelected = canvasColor.toLowerCase() === color.toLowerCase()
                          return (
                            <button
                              key={color}
                              onClick={() => setCanvasColor(color)}
                              className={cn(
                                'w-6 h-6 rounded-full border transition-all hover:scale-110 cursor-pointer',
                                isSelected
                                  ? 'border-blue-600 ring-2 ring-blue-200 scale-110'
                                  : 'border-gray-200'
                              )}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )
                        })}
                      </div>
                    )}
                    {resolvedTheme === 'dark' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['#18181b', '#0f172a', '#1e1e1e', '#000000', '#27272a'].map((color) => {
                          const isSelected = canvasColor.toLowerCase() === color.toLowerCase()
                          return (
                            <button
                              key={color}
                              onClick={() => setCanvasColor(color)}
                              className={cn(
                                'w-6 h-6 rounded-full border transition-all hover:scale-110 cursor-pointer',
                                isSelected
                                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-110'
                                  : 'border-zinc-700'
                              )}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WorkspaceClearPrompt
        isOpen={showClearConfirm}
        onConfirm={confirmClearWorkspace}
        onCancel={() => setShowClearConfirm(false)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        actions={{
          onOpen: handleOpen,
          onSaveAs: handleSaveAs,
          onExportImage: handleExportImage,
          onClearWorkspace: handleClearWorkspace,
          onToggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
          onLayoutEditToggle: onLayoutEditToggle,
          onWorkspaces: onWorkspaces,
          onHelp: () => {
            setShowCommandPalette(false)
            setShowHelp(true)
          },
          onFindCanvas: () => {
            setShowCommandPalette(false)
            onFindCanvas?.()
          },
          onRealTimeColab: () => {
            setShowCommandPalette(false)
            setShowRealTimeColab(true)
          }
        }}
      />

      <HelpDialog
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <RealTimeColabPrompt
        isOpen={showRealTimeColab}
        onClose={() => setShowRealTimeColab(false)}
        onStartSession={() => {
          console.log('Starting session...')
          if (onRealTimeColab) onRealTimeColab()
        }}
      />

      <UserSettingsPrompt
        isOpen={showUserSettings}
        onClose={() => setShowUserSettings(false)}
        elementCount={elementCount}
      />
    </motion.div>
  )
}