'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Mail, Loader2, Eye, EyeOff, Check, User, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [showPasswordHelp, setShowPasswordHelp] = useState(false)
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

    const validatePassword = (password: string, username: string = '') => {
        const rules = {
            minLength: password.length >= 8,
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            noUsername: username ? !password.toLowerCase().includes(username.toLowerCase()) : true
        }
        return { rules, isValid: Object.values(rules).every(Boolean) }
    }

    const passwordValidation = validatePassword(formData.password, formData.name)

    const handlePasswordChange = (value: string) => {
        setFormData(prev => ({ ...prev, password: value }))
        if (value.length > 0) setShowPasswordHelp(true)
        if (typingTimeout) clearTimeout(typingTimeout)
        if (value.length > 0) {
            const timeout = setTimeout(() => setShowPasswordHelp(false), 3000)
            setTypingTimeout(timeout)
        } else if (value.length === 0) {
            setShowPasswordHelp(false)
        }
    }

    useEffect(() => {
        return () => { if (typingTimeout) clearTimeout(typingTimeout) }
    }, [typingTimeout])

    const handleOAuth = (provider: 'facebook' | 'github' | 'google') => {
        setIsLoading(provider)
        console.log(`Register with ${provider}`)
        setTimeout(() => setIsLoading(null), 2000)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!passwordValidation.isValid || !agreedToTerms) return;

        setIsLoading('email')
        console.log('Email register', formData)
        setTimeout(() => setIsLoading(null), 2000)
    }

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col relative overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-6">
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">

                <circle cx="8%" cy="12%" r="25" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
                <rect x="5%" y="8%" width="35" height="35" stroke="#a855f7" strokeWidth="2" fill="none" transform="rotate(25 7% 10%)" opacity="0.5" />
                <path d="M 10% 18% Q 12% 16%, 14% 18% T 18% 18%" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.5" />
                <circle cx="6%" cy="22%" r="4" fill="#a855f7" opacity="0.4" />
                <circle cx="11%" cy="24%" r="3" fill="#a855f7" opacity="0.3" />

                <path d="M 42% 8% L 44% 6% L 46% 8% L 48% 6% L 50% 8%" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="45%" cy="14%" r="18" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.5" />
                <path d="M 48% 20% L 50% 18% M 50% 20% L 48% 18%" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <rect x="40%" y="16%" width="25" height="25" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(-15 42.5% 18.5%)" opacity="0.4" />

                <path d="M 88% 10% L 90% 8% L 89% 6% L 91% 4%" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="92%" cy="15%" r="20" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 85% 12% Q 87% 10%, 89% 12% Q 91% 14%, 93% 12%" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.5" />
                <circle cx="90%" cy="20%" r="5" fill="#ec4899" opacity="0.4" />
                <path d="M 86% 18% L 87% 16% L 88.5% 18% L 87% 20% Z" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />

                <path d="M 8% 42% C 10% 40%, 12% 44%, 14% 42%" stroke="#eab308" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="6%" cy="48%" r="15" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.5" />
                <rect x="10%" y="45%" width="30" height="30" stroke="#eab308" strokeWidth="2" fill="none" transform="rotate(45 13% 48%)" opacity="0.5" />
                <path d="M 7% 52% L 9% 50% M 9% 52% L 7% 50%" stroke="#eab308" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                <circle cx="12%" cy="38%" r="3" fill="#eab308" opacity="0.5" />

                <circle cx="50%" cy="45%" r="22" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 45% 48% L 47% 46% L 49% 48% L 51% 46% L 53% 48% L 55% 46%" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <rect x="47%" y="40%" width="28" height="28" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.4" />
                <path d="M 52% 50% Q 54% 48%, 56% 50% T 60% 50%" stroke="#10b981" strokeWidth="2.5" fill="none" opacity="0.5" />
                <circle cx="48%" cy="52%" r="4" fill="#10b981" opacity="0.4" />

                <path d="M 88% 45% L 90% 43% L 92% 45% L 94% 43%" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="90%" cy="50%" r="19" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.5" />
                <path d="M 85% 48% L 87% 46% L 89% 48% L 87% 50% Z" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />
                <rect x="91%" y="43%" width="32" height="32" stroke="#f97316" strokeWidth="2" fill="none" transform="rotate(-20 93% 47%)" opacity="0.4" />
                <circle cx="88%" cy="53%" r="3.5" fill="#f97316" opacity="0.5" />

                <circle cx="10%" cy="78%" r="24" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M 5% 82% Q 7% 80%, 9% 82% T 13% 82%" stroke="#ef4444" strokeWidth="2.5" fill="none" opacity="0.5" />
                <rect x="8%" y="85%" width="26" height="26" stroke="#ef4444" strokeWidth="2" fill="none" transform="rotate(30 11% 88%)" opacity="0.5" />
                <path d="M 6% 90% L 8% 88% M 8% 90% L 6% 88%" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <circle cx="13%" cy="75%" r="4.5" fill="#ef4444" opacity="0.4" />
                <path d="M 7% 72% L 9% 70% L 11% 72% L 9% 74% Z" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.5" />

                <path d="M 44% 82% C 46% 80%, 48% 84%, 50% 82%" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="48%" cy="88%" r="17" stroke="#14b8a6" strokeWidth="2" fill="none" strokeDasharray="4,3" opacity="0.5" />
                <rect x="42%" y="78%" width="30" height="30" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(15 45% 81%)" opacity="0.4" />
                <path d="M 50% 84% L 52% 82% L 54% 84% L 56% 82%" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                <circle cx="46%" cy="92%" r="3" fill="#14b8a6" opacity="0.4" />

                <circle cx="88%" cy="80%" r="21" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M 92% 85% Q 94% 83%, 96% 85%" stroke="#6366f1" strokeWidth="2.5" fill="none" opacity="0.5" />
                <rect x="84%" y="88%" width="28" height="28" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(-25 86% 90%)" opacity="0.5" />
                <path d="M 90% 76% L 92% 74% M 92% 76% L 90% 74%" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <circle cx="94%" cy="92%" r="4" fill="#6366f1" opacity="0.4" />

                <circle cx="22%" cy="28%" r="12" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.4" />
                <circle cx="68%" cy="32%" r="10" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.5" />
                <circle cx="30%" cy="62%" r="14" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.4" />
                <circle cx="75%" cy="68%" r="11" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3,2" opacity="0.5" />

                <rect x="18%" y="55%" width="20" height="20" stroke="#10b981" strokeWidth="2" fill="none" transform="rotate(35 20% 57%)" opacity="0.4" />
                <rect x="62%" y="22%" width="22" height="22" stroke="#f97316" strokeWidth="2" fill="none" transform="rotate(-30 64% 24%)" opacity="0.4" />
                <rect x="28%" y="15%" width="18" height="18" stroke="#ef4444" strokeWidth="2" fill="none" transform="rotate(50 29% 17%)" opacity="0.4" />
                <rect x="72%" y="58%" width="24" height="24" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(-40 74% 60%)" opacity="0.4" />

                <path d="M 25% 35% L 27% 33% M 27% 35% L 25% 33%" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 65% 42% L 67% 40% M 67% 42% L 65% 40%" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 35% 72% L 37% 70% M 37% 72% L 35% 70%" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 80% 28%" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

                <path d="M 15% 45% Q 17% 43%, 19% 45%" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 58% 65% Q 60% 63%, 62% 65%" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 38% 25% Q 40% 23%, 42% 25%" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 82% 72% Q 84% 70%, 86% 72%" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.5" />

                <circle cx="33%" cy="50%" r="3" fill="#14b8a6" opacity="0.5" />
                <circle cx="55%" cy="28%" r="3.5" fill="#6366f1" opacity="0.5" />
                <circle cx="70%" cy="75%" r="3" fill="#a855f7" opacity="0.5" />
                <circle cx="20%" cy="68%" r="3.5" fill="#3b82f6" opacity="0.5" />
                <circle cx="78%" cy="38%" r="3" fill="#ec4899" opacity="0.5" />
                <circle cx="42%" cy="88%" r="3.5" fill="#eab308" opacity="0.5" />

                <path d="M 26% 82% L 26% 86% M 24% 84% L 28% 84%" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <path d="M 74% 12% L 74% 16% M 72% 14% L 76% 14%" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <path d="M 16% 32% L 16% 36% M 14% 34% L 18% 34%" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                <path d="M 84% 62% L 84% 66% M 82% 64% L 86% 64%" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

                <path d="M 52% 18% L 54% 16% L 56% 18% L 54% 20% Z" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 32% 92% L 34% 90% L 36% 92% L 34% 94% Z" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 92% 48% L 94% 46% L 96% 48% L 94% 50% Z" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.5" />

                <path d="M 24% 48% Q 26% 46%, 28% 48% T 32% 48%" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 58% 78% Q 60% 76%, 62% 78% T 66% 78%" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.5" />
                <path d="M 12% 58% L 14% 56% L 16% 58% L 18% 56%" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                <path d="M 88% 32% L 90% 30% L 92% 32% L 94% 30%" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
            </svg>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                <div className="absolute inset-0 rounded-3xl" style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.5)'
                }} />

                <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10">
                    <div className="text-center mb-8 relative">
                        <h2 className="text-4xl font-caveat text-white mb-2 tracking-wide font-bold">Create Account</h2>
                        <svg className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-32 h-4 pointer-events-none opacity-40">
                            <path
                                d="M 5 2 Q 16 4, 32 2 T 64 2 T 96 2 T 127 2"
                                stroke="white"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                        <p className="text-white/40 mt-4">Start your journey with us.</p>
                    </div>



                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                                style={{
                                    WebkitBoxShadow: '0 0 0 1000px rgba(10, 10, 10, 1) inset !important',
                                    WebkitTextFillColor: '#FFFFFF !important',
                                    caretColor: '#FFFFFF',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                    target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onFocus={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                }}
                            />
                        </div>

                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                required
                                className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                                style={{
                                    WebkitBoxShadow: '0 0 0 1000px rgba(10, 10, 10, 1) inset !important',
                                    WebkitTextFillColor: '#FFFFFF !important',
                                    caretColor: '#FFFFFF',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                    target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onFocus={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                }}
                            />
                        </div>

                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-4 bg-[#0a0a0a] border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-all"
                                style={{
                                    WebkitBoxShadow: '0 0 0 1000px rgba(10, 10, 10, 1) inset',
                                    WebkitTextFillColor: '#FFFFFF',
                                    caretColor: '#FFFFFF',
                                }}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                    target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onFocus={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.style.setProperty('-webkit-box-shadow', '0 0 0 1000px rgba(10, 10, 10, 1) inset');
                                    target.style.setProperty('-webkit-text-fill-color', '#FFFFFF');
                                }}
                            />
                            {formData.password.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {showPasswordHelp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                                        {[
                                            { check: passwordValidation.rules.minLength, text: 'Minimum 8 characters' },
                                            { check: passwordValidation.rules.hasNumber, text: 'At least one number' },
                                            { check: passwordValidation.rules.hasSpecialChar, text: 'At least one special character' },
                                        ].map((rule, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${rule.check ? 'bg-green-500/20 border-green-500/40' : 'bg-white/5 border-white/20'}`}>
                                                    {rule.check && <Check size={10} className="text-green-400" />}
                                                </div>
                                                <span className={rule.check ? 'text-green-400' : 'text-white/40'}>{rule.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                className={`w-5 h-5 border rounded flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${agreedToTerms ? 'bg-white border-white' : 'border-white/20 hover:border-white/40'
                                    }`}
                            >
                                {agreedToTerms && <Check size={12} className="text-black" />}
                            </button>
                            <span className="text-sm text-white/40">
                                I agree to the{' '}
                                <Link href="/terms" className="text-white/70 hover:text-white underline">Terms</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="text-white/70 hover:text-white underline">Privacy Policy</Link>
                            </span>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading !== null || !passwordValidation.isValid || !agreedToTerms}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "w-full py-4 bg-white text-black hover:bg-white/90 font-semibold rounded-xl transition-all cursor-pointer",
                                "disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white",
                                isLoading === 'email' && "opacity-70"
                            )}
                        >
                            {isLoading === 'email' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </motion.button>
                    </form>

                    <div className="text-center">
                        <p className="text-white/40 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white hover:text-white/80 transition-colors font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <svg className="absolute -right-12 bottom-20 w-20 h-20 pointer-events-none opacity-20 hidden sm:block">
                        <path
                            d="M 5 5 Q 10 15, 15 10 T 25 15"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                        />
                        <path
                            d="M 23 12 L 25 15 L 22 16"
                            stroke="white"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>

                </div>
            </motion.div>
            </div>
        </div>
    )
}