'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Loader2, Check, ArrowLeft, Info, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { AccountStatusModal, AccountStatusType } from '@/components/accountStatusModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
  defaultMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [tempUserData, setTempUserData] = useState<any>(null)
  const [storedPassword, setStoredPassword] = useState<string>('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  
  const [showPasswordHelp, setShowPasswordHelp] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showNullPassInfo, setShowNullPassInfo] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [accountStatusType, setAccountStatusType] = useState<AccountStatusType>(null)
  const [showAccountStatusModal, setShowAccountStatusModal] = useState(false)
  const [showOAuthInfo, setShowOAuthInfo] = useState(false)
  const [showMoreOAuthOptions, setShowMoreOAuthOptions] = useState(false)

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
    if (!isLogin && value.length > 0) setShowPasswordHelp(true)
    if (typingTimeout) clearTimeout(typingTimeout)
    if (!isLogin && value.length > 0) {
      const timeout = setTimeout(() => setShowPasswordHelp(false), 3000)
      setTypingTimeout(timeout)
    } else if (value.length === 0) {
      setShowPasswordHelp(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultMode === 'login')
      setError('')
      setShow2FA(false)
      setTwoFactorCode('')
      setFormData({ email: '', password: '', name: '' })
      setAgreedToTerms(false)
      setShowPassword(false)
    }
  }, [isOpen, defaultMode])

  useEffect(() => {
    return () => { if (typingTimeout) clearTimeout(typingTimeout) }
  }, [typingTimeout])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!isLogin && !passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements')
      setShowPasswordHelp(true)
      setIsLoading(false)
      return
    }

    if (!isLogin && !agreedToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin ? { email: formData.email, password: formData.password } : formData
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      
      if (response.status === 403 && data.accountStatus) {
        setAccountStatusType(data.accountStatus as AccountStatusType)
        setShowAccountStatusModal(true)
        onClose()
        return
      }
      
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      if (data.requires2FA && isLogin) {
        setShow2FA(true)
        setTempUserData(data.user)
        setStoredPassword(formData.password)
        return
      }
      onSuccess(data.user)
      onClose()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const requestBody = { 
        verificationCode: twoFactorCode,
        email: formData.email,
        password: storedPassword || formData.password,
      }
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
      const data = await response.json()
      
      if (response.status === 403 && data.accountStatus) {
        setAccountStatusType(data.accountStatus as AccountStatusType)
        setShowAccountStatusModal(true)
        onClose()
        return
      }
      
      if (!response.ok) throw new Error(data.error || 'Invalid verification code')
      try { await fetch('/api/auth/me', { method: 'GET', credentials: 'include', cache: 'no-store' }) } catch {}
      onSuccess(data.user || tempUserData)
      onClose()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '' })
    setShow2FA(false)
    setTwoFactorCode('')
    setTempUserData(null)
    setStoredPassword('')
    setError('')
    setShowPasswordHelp(false)
    setAgreedToTerms(false)
    setShowPassword(false)
    setAccountStatusType(null)
    setShowAccountStatusModal(false)
  }

  return (
    <>
    <AccountStatusModal
      isOpen={showAccountStatusModal}
      onClose={() => {
        setShowAccountStatusModal(false)
        setAccountStatusType(null)
      }}
      statusType={accountStatusType}
    />
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
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-nothing text-white mb-2 tracking-wider">
                  {show2FA ? '2FA VERIFY' : (isLogin ? 'WELCOME BACK' : 'GET STARTED')}
                </h2>
                <p className="text-white/40">
                  {show2FA ? 'Enter the 6-digit code from your authenticator' : (isLogin ? 'Sign in to continue' : 'Create your account')}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={show2FA ? handleVerify2FA : handleSubmit} className="space-y-5">
                {show2FA ? (
                  <div className="flex flex-col items-center gap-4">
                    <InputOTP 
                      maxLength={6} 
                      value={twoFactorCode} 
                      onChange={setTwoFactorCode}
                      containerClassName="flex items-center gap-4"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                ) : (
                  <>
                    {!isLogin && (
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10" />
                        <input
                          type="text"
                          placeholder="Display Name"
                          value={formData.name}
                          onChange={(e) => e.target.value.length <= 50 && setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          autoComplete="name"
                          className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
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
                    )}

                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        autoComplete="email"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
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
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-10" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                        className={`w-full pl-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all ${formData.password.length > 0 ? 'pr-12' : 'pr-4'}`}
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
                      <AnimatePresence>
                        {formData.password.length > 0 && (
                          <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer z-10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {!isLogin && showPasswordHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2"
                      >
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
                      </motion.div>
                    )}

                    {!isLogin && (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                          className={`w-5 h-5 border rounded flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                            agreedToTerms ? 'bg-white border-white' : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {agreedToTerms && <Check size={12} className="text-black" />}
                        </button>
                        <span className="text-sm text-white/40">
                          I agree to the{' '}
                          <a href="/terms" target="_blank" className="text-white/70 hover:text-white underline">Terms</a>
                          {' '}and{' '}
                          <a href="/privacy" target="_blank" className="text-white/70 hover:text-white underline">Privacy Policy</a>
                        </span>
                      </div>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || (show2FA && twoFactorCode.length !== 6) || (!isLogin && (!passwordValidation.isValid || !agreedToTerms))}
                  className="w-full py-4 bg-white text-black hover:bg-white/90 font-semibold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin mr-2" />{show2FA ? 'Verifying...' : (isLogin ? 'Signing in...' : 'Creating...')}</>
                  ) : (
                    show2FA ? 'Verify Code' : (isLogin ? 'Sign In' : 'Create Account')
                  )}
                </Button>
              </form>

              {!show2FA && isLogin && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center items-center text-sm">
                      <span className="px-4 bg-[#0a0a0a] text-white/40 flex items-center gap-1.5">
                        Or continue with
                        <div className="relative">
                          <button
                            type="button"
                            onMouseEnter={() => setShowOAuthInfo(true)}
                            onMouseLeave={() => setShowOAuthInfo(false)}
                            className="text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                          >
                            <Info size={14} />
                          </button>
                          <AnimatePresence>
                            {showOAuthInfo && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-xl z-50"
                              >
                                <p className="text-xs text-white/70 leading-relaxed">
                                  Our vision of Null Pass as one unified account remains. You can now use Google or GitHub to sign in, but it's still the same Null Pass account.
                                </p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#0a0a0a] border-r border-b border-white/20 rotate-45" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 opacity-50 cursor-not-allowed"
                    >
                      <img src="/logo/saas/google.svg" alt="Google" className="w-6 h-6 object-contain" />
                      <span className="font-medium">Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      disabled
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 opacity-50 cursor-not-allowed"
                    >
                      <img src="/logo/saas/git.svg" alt="GitHub" className="w-6 h-6 object-contain brightness-0 invert" />
                      <span className="font-medium">Continue with GitHub</span>
                    </button>

                    <AnimatePresence>
                      {showMoreOAuthOptions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden space-y-3"
                        >
                          <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 opacity-50 cursor-not-allowed"
                          >
                            <img src="/logo/saas/microsoft.svg" alt="Microsoft" className="w-6 h-6 object-contain" />
                            <span className="font-medium">Continue with Microsoft</span>
                          </button>

                          <button
                            type="button"
                            disabled
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 opacity-50 cursor-not-allowed"
                          >
                            <img src="/logo/saas/apple.svg" alt="Apple" className="w-6 h-6 object-contain" />
                            <span className="font-medium">Continue with Apple</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => setShowMoreOAuthOptions(!showMoreOAuthOptions)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white/40 hover:text-white/60 transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-sm font-medium">See more options</span>
                      <motion.div
                        animate={{ rotate: showMoreOAuthOptions ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>
                  </div>
                </>
              )}

              <div className="mt-8 text-center">
                {show2FA ? (
                  <button
                    type="button"
                    onClick={() => { setShow2FA(false); setTwoFactorCode(''); setError('') }}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mx-auto cursor-pointer"
                  >
                    <ArrowLeft size={16} />Back to login
                  </button>
                ) : (
                  <p className="text-white/40">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ email: '', password: '', name: '' }) }}
                      className="ml-2 text-white hover:text-white/80 transition-colors font-medium cursor-pointer"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-1.5 relative">
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
                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowNullPassInfo(true)}
                    onMouseLeave={() => setShowNullPassInfo(false)}
                    className="text-white/30 hover:text-white/50 transition-colors cursor-pointer"
                  >
                    <Info size={16} />
                  </button>
                  {showNullPassInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-xl z-50"
                    >
                      <p className="text-xs text-white/70 leading-relaxed">
                        Null Pass is a secure authentication system for null applications
                      </p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#0a0a0a] border-r border-b border-white/20 rotate-45" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}