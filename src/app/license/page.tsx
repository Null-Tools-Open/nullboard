'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export default function LicensePage() {

  const licensePlans = [
    {
      name: 'Monthly',
      price: '$3.99',
      period: 'per month',
      description: 'Perfect for trying out Null Board',
      features: [
        'Cloud sync',
        'Unlimited whiteboards/workspaces',
        'Unlimited real-time collaboration',
        'Easy drag & drop',
        'Font Importer',
        'Branching',
        'Comments & Chat',
        'Presentation',
        'Unlimited canvas objects',
        'Smart object recognition',
        'Premium Icon Pack',
        'GPU acceleraction',
        'OCR (Text recognition)',
        'Vectorization (Images)',
        'Cancel anytime'
      ],
      popular: false
    },
    {
      name: 'Annual',
      price: '$19.99',
      period: 'per year',
      description: 'Best value for regular users',
      features: [
        'Cloud sync',
        'Unlimited whiteboards/workspaces',
        'Unlimited real-time collaboration',
        'Easy drag & drop',
        'Unlimited canvas objects',
        'Font Importer',
        'Smart object recognition',
        'Premium Icon Pack',
        'Branching',
        'Comments & Chat',
        'Presentation',
        'GPU acceleraction',
        'OCR (Text recognition)',
        'Vectorization (Images)',
        'Save 44% compared to monthly',
        'Cancel anytime'
      ],
      popular: true
    },
    {
      name: 'One-Time',
      price: '$34.99',
      period: 'one-time payment',
      description: 'Lifetime access, pay once',
      features: [
        'Cloud sync',
        'Unlimited whiteboards/workspaces',
        'Unlimited real-time collaboration',
        'Easy drag & drop',
        'Unlimited canvas objects',
        'Font Importer',
        'Branching',
        'Comments & Chat',
        'Presentation',
        'Smart object recognition',
        'Premium Icon Pack',
        'GPU acceleraction',
        'OCR (Text recognition)',
        'Vectorization (Images)',
        'One time payment',
        'Cancel anytime'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden flex flex-col font-sans">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 flex-grow w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-16 text-center">

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 relative inline-block">
              Choose your plan
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-white/20 rounded-full blur-[1px]"></span>
            </h1>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-light">
              Simple pricing for everyone. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {licensePlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative p-8 group h-full flex flex-col",
                  plan.popular ? "z-10" : "z-0"
                )}
              >
                <div className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  plan.popular ? "text-white/30" : "text-white/10 group-hover:text-white/20"
                )}>
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <filter id={`doodle-filter-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                      </filter>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      rx="12"
                      ry="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                      filter={`url(#doodle-filter-${index})`}
                    />
                    <rect
                      x="4"
                      y="4"
                      width="calc(100% - 8px)"
                      height="calc(100% - 8px)"
                      rx="8"
                      ry="8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                      vectorEffect="non-scaling-stroke"
                      filter={`url(#doodle-filter-${index})`}
                      className="opacity-20"
                    />
                  </svg>
                </div>

                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-32 h-10">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <filter id={`badge-filter-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                        </filter>
                      </defs>
                      <path
                        d="M2,5 Q 16,2 32,5 T 64,5 T 96,5 L 96,25 Q 80,28 64,25 T 32,25 T 2,25 Z"
                        fill="#0a0a0a"
                        stroke="rgba(59, 130, 246, 0.6)"
                        strokeWidth="1.5"
                        filter={`url(#badge-filter-${index})`}
                        vectorEffect="non-scaling-stroke"
                        transform="scale(1.2, 1.2) translate(-3, -2)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-blue-400 text-xs font-bold uppercase tracking-widest font-mono">
                        Popular
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 flex flex-col h-full mt-4">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white/90 mb-2 font-mono uppercase tracking-tight">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-4xl font-bold text-white tracking-widest">{plan.price}</span>
                    </div>
                    <p className="text-white/40 text-sm border-b border-white/5 pb-4 font-light">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className="relative w-5 h-5 flex-shrink-0 mt-0.5">
                          <Check className={cn(
                            "w-4 h-4 transition-colors",
                            plan.popular ? "text-blue-500" : "text-white/30 group-hover/item:text-white/60"
                          )} />
                        </div>
                        <span className="text-white/60 text-sm font-light leading-relaxed group-hover/item:text-white/80 transition-colors">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className="w-full py-4 px-6 relative group/btn bg-transparent border-none outline-none cursor-pointer overflow-visible"
                  >
                    <div className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none">
                      <svg className="w-full h-full overflow-visible">
                        <rect
                          x="4"
                          y="4"
                          width="calc(100% - 8px)"
                          height="calc(100% - 8px)"
                          rx="12"
                          ry="12"
                          fill={plan.popular ? "rgba(59, 130, 246, 0.1)" : "transparent"}
                          stroke={plan.popular ? "rgba(59, 130, 246, 0.6)" : "rgba(255, 255, 255, 0.4)"}
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                          filter={`url(#doodle-filter-${index})`}
                          className="transition-all duration-300 group-hover/btn:stroke-[2px]"
                        />
                      </svg>
                    </div>

                    <span className={cn(
                      "relative z-10 font-bold font-caveat text-2xl tracking-wide transition-colors duration-300",
                      plan.popular ? "text-blue-400 group-hover/btn:text-blue-300" : "text-white/80 group-hover/btn:text-white"
                    )}>
                      Select Plan
                    </span>
                  </button>
                  <div className="text-center mt-3">
                    <span className="text-white/20 text-xs font-mono lowercase">{plan.period}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 text-center"
          >
            <div className="inline-block relative p-6 max-w-2xl">

              <svg className="absolute inset-0 w-full h-full text-white/10 pointer-events-none" preserveAspectRatio="none">
                <rect x="0" y="0" width="100%" height="100%" rx="20" stroke="currentColor" strokeWidth="1" strokeDasharray="8 6" fill="none" />
              </svg>
              <h3 className="text-lg font-bold text-white/80 mb-2 font-caveat text-xl">Just so you know...</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                All licenses include full access to Null Board features. You can cancel your subscription at any time.
                <br />
                Read our <Link href="/terms" className="text-white/60 hover:text-white underline decoration-white/20 underline-offset-4">Terms</Link> and <Link href="/privacy" className="text-white/60 hover:text-white underline decoration-white/20 underline-offset-4">Privacy Policy</Link>.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}