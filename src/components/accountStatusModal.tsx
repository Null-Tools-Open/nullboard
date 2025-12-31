'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, UserX, Unplug, ExternalLink, MessageCircle, Hammer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AccountStatusType = 'banned' | 'disabled' | 'disconnected' | null

interface AccountStatusModalProps {
  isOpen: boolean
  onClose: () => void
  statusType: AccountStatusType
}

const STATUS_CONFIG = {
  banned: {
    icon: Hammer,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    title: 'Account Banned',
    description: `Your account has been banned. We can't disclose the exact reason, but you have violated our community guidelines.`,
    details: [
      'Please refrain from creating other accounts',
      'This ban is not permanent',
      'You can submit a ticket in our Discord server to request an unban'
    ],
    primaryAction: {
      label: 'Join Discord',
      href: 'https://discord.gg/nulldrop',
      icon: MessageCircle
    },
    borderColor: 'border-red-500/20',
    gradientFrom: 'from-red-500/10'
  },
  disabled: {
    icon: UserX,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
    title: 'Account Disabled',
    description: 'Your account has been disabled at your request.',
    details: [
      'To re-enable your account, please log in to Null Pass',
      'Navigate to your account settings',
      'Enable your account to regain access to Null Drop'
    ],
    primaryAction: {
      label: 'Go to Null Pass',
      href: 'https://nullpass.xyz',
      icon: ExternalLink
    },
    borderColor: 'border-yellow-500/20',
    gradientFrom: 'from-yellow-500/10'
  },
  disconnected: {
    icon: Unplug,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    title: 'Service Disconnected',
    description: 'Null Drop has been disconnected from your account.',
    details: [
      'Please go to Null Pass to reconnect Null Drop as your service',
      'Navigate to the Services section in your account',
      'Re-enable Null Drop to regain access'
    ],
    primaryAction: {
      label: 'Go to Null Pass',
      href: 'https://nullpass.xyz/services',
      icon: ExternalLink
    },
    borderColor: 'border-orange-500/20',
    gradientFrom: 'from-orange-500/10'
  }
}

export function AccountStatusModal({ isOpen, onClose, statusType }: AccountStatusModalProps) {
  if (!statusType) return null
  
  const config = STATUS_CONFIG[statusType]
  const IconComponent = config.icon
  const ActionIcon = config.primaryAction.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className={`relative w-full max-w-lg bg-[#0a0a0a] border ${config.borderColor} rounded-3xl overflow-hidden shadow-2xl`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${config.gradientFrom} to-transparent pointer-events-none`} />
            
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center mb-6`}>
                  <IconComponent size={40} className={config.iconColor} />
                </div>
                
                <h2 className="text-2xl font-nothing text-white mb-3 tracking-wider">
                  {config.title}
                </h2>
                
                <p className="text-white/60 leading-relaxed">
                  {config.description}
                </p>
              </div>

              <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                {config.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-white/60">{index + 1}</span>
                    </div>
                    <p className="text-sm text-white/70">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <a
                  href={config.primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    className="w-full py-4 bg-white text-black hover:bg-white/90 font-semibold rounded-xl cursor-pointer"
                  >
                    <ActionIcon size={18} className="mr-2" />
                    {config.primaryAction.label}
                  </Button>
                </a>
                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full py-4 text-white/60 hover:text-white hover:bg-white/5 font-medium rounded-xl cursor-pointer"
                >
                  Close
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-1.5">
                <img src="/nullpass.png" alt="Null Pass" className="w-7 h-7 brightness-0 invert opacity-50 object-contain" />
                <span className="text-sm text-white/30">Protected by</span>
                <a 
                  href="https://nullpass.xyz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent hover:from-gray-300 hover:via-white hover:to-gray-300 transition-all cursor-pointer"
                >
                  Null Pass
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}