'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { DiscordIcon, X } from './icons/pack'
import { Github, Linkedin, ArrowUpRight } from 'lucide-react'

export function Footer() {
  const footerSections: {
    title: string
    links: { name: string; href: string; external?: boolean; soon?: boolean }[]
  }[] = [
      {
        title: 'Explore',
        links: [
          { name: 'Blog', href: '/blog' },
          // { name: 'Libraries', href: '/libraries' },
          { name: 'Community', href: '/community' },
          // { name: 'Use Cases', href: '/use-cases' },
          // { name: 'Security & Compliance', href: '/security' },
          // { name: 'NPM package', href: 'https://npmjs.com/package/nullboard', external: true },
          { name: 'Terms of use', href: '/terms' },
          { name: 'Privacy Policy', href: '/privacy' },
          { name: 'Status page', href: 'https://status.nulltools.xyz', external: true },
        ]
      },
      {
        title: 'Product',
        links: [
          { name: 'Documentation', href: 'https://docs.nullboard.xyz', external: true },
          { name: 'Features', href: '/features' },
          // { name: 'For Teams', href: '/teams' },
          // { name: 'For Education', href: '/education' },
          { name: 'License', href: '/license' },
          // { name: 'Release notes', href: '/releases' },
        ]
      },
      {
        title: 'Contact us',
        links: [
          { name: 'support@nulltools.xyz', href: 'mailto:support@nulltools.xyz' },
        ]
      }
    ]

  const socialLinks = [
    { icon: X, href: 'https://x.com/NullToolsXYZ', label: 'X (Twitter)' },
    { icon: Github, href: 'https://github.com/Null-Tools-Open', label: 'GitHub' },
    { icon: DiscordIcon, href: 'https://discord.gg/7WMZh7jjEB', label: 'Discord' },
  ]

  return (
    <footer className="relative bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ mixBlendMode: 'normal' }}>

        <path d="M 100 480 Q 120 460, 140 480" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="250" cy="470" r="8" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="550" y="460" width="18" height="18" stroke="#a855f7" strokeWidth="2" fill="none" transform="rotate(18 559 469)" opacity="0.6" />
        <path d="M 950 480 L 975 455 M 975 480 L 950 455" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        <circle cx="150" cy="500" r="7" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="700" y="490" width="14" height="14" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(-18 707 497)" opacity="0.6" />
        <path d="M 1050 500 Q 1070 480, 1090 500" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />

        <path d="M 200 240 Q 220 220, 240 240" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="500" cy="230" r="16" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="900" y="220" width="30" height="30" stroke="#f97316" strokeWidth="2" fill="none" transform="rotate(20 915 235)" opacity="0.6" />
        <circle cx="750" cy="330" r="12" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.6" />
        <path d="M 350 440 L 375 415 M 375 440 L 350 415" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="600" cy="430" r="9" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1000" y="420" width="17" height="17" stroke="#f97316" strokeWidth="2" fill="none" transform="rotate(22 1008.5 428.5)" opacity="0.6" />
        <path d="M 250 540 Q 270 520, 290 540" stroke="#eab308" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="850" cy="530" r="5" stroke="#f97316" strokeWidth="2" fill="none" strokeDasharray="1,1" opacity="0.6" />

        <path d="M 150 260 L 175 235 M 175 260 L 150 235" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="650" cy="250" r="15" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.6" />
        <rect x="1100" y="240" width="28" height="28" stroke="#ec4899" strokeWidth="2" fill="none" transform="rotate(-24 1114 254)" opacity="0.6" />
        <path d="M 200 360 Q 220 340, 240 360" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="550" cy="350" r="11" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1050" y="340" width="22" height="22" stroke="#ef4444" strokeWidth="2" fill="none" transform="rotate(26 1061 351)" opacity="0.6" />
        <path d="M 300 460 L 325 435 L 350 460 L 335 490" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="750" cy="450" r="8" stroke="#ef4444" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.6" />
        <path d="M 400 560 L 425 535 M 425 560 L 400 535" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="1000" cy="550" r="4" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />

        <path d="M 80 260 L 105 235 M 105 260 L 80 235" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="400" cy="250" r="14" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="800" y="240" width="27" height="27" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(24 813.5 253.5)" opacity="0.6" />
        <circle cx="450" cy="350" r="10" stroke="#14b8a6" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.6" />
        <rect x="950" y="340" width="21" height="21" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(-26 960.5 350.5)" opacity="0.6" />
        <path d="M 180 460 Q 200 440, 220 460" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="700" cy="450" r="7" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 220 560 L 245 535 M 245 560 L 220 535" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="1100" cy="550" r="3" stroke="#14b8a6" strokeWidth="2" fill="none" strokeDasharray="1,1" opacity="0.6" />

        <path d="M 130 240 Q 150 220, 170 240" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="350" cy="230" r="13" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.6" />
        <rect x="850" y="220" width="26" height="26" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(-21 863 233)" opacity="0.6" />
        <circle cx="500" cy="330" r="9" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1000" y="320" width="19" height="19" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(27 1009.5 329.5)" opacity="0.6" />
        <path d="M 200 440 L 225 415 L 250 440 L 235 470" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="600" cy="430" r="6" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="1.5,1.5" opacity="0.6" />
        <path d="M 250 540 Q 270 520, 290 540" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="950" cy="530" r="2" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />

        <path d="M 150 190 L 170 170 L 190 190 L 210 170 L 230 190" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 500 290 L 520 270 L 540 290 L 560 270 L 580 290" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 100 390 L 120 370 L 140 390 L 160 370 L 180 390" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 400 490 L 420 470 L 440 490 L 460 470 L 480 490" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 900 190 L 920 170 L 940 190 L 960 170" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 1100 390 L 1120 370 L 1140 390 L 1160 370" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

        <circle cx="30" cy="200" r="12" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="20" y="300" width="25" height="25" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(25 32.5 312.5)" opacity="0.6" />
        <path d="M 10 400 L 35 375 M 35 400 L 10 375" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="40" cy="500" r="10" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.6" />

        <circle cx="50" cy="250" r="8" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 5 350 L 25 330 L 45 350" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="60" cy="450" r="7" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.6" />

        <circle cx="1170" cy="200" r="12" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1155" y="300" width="25" height="25" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(-25 1167.5 312.5)" opacity="0.6" />
        <path d="M 1165 400 L 1190 375 M 1190 400 L 1165 375" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="1160" cy="500" r="10" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.6" />
        <path d="M 1165 600 Q 1175 580, 1185 600" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1155" y="700" width="20" height="20" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(20 1165 710)" opacity="0.6" />
        <circle cx="1150" cy="250" r="8" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 1155 350 L 1175 330 L 1195 350" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="1140" cy="450" r="7" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.6" />
        <path d="M 1160 550 L 1180 530 M 1180 550 L 1160 530" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <rect x="1155" y="650" width="15" height="15" stroke="#eab308" strokeWidth="2" fill="none" transform="rotate(-18 1162.5 657.5)" opacity="0.6" />
        <path d="M 1180 180 L 1195 165 L 1195 195" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="1190" cy="350" r="6" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="1180" y="550" width="18" height="18" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(22 1189 559)" opacity="0.6" />


        <circle cx="500" cy="610" r="12" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.6" />
        <rect x="900" y="600" width="25" height="25" stroke="#a855f7" strokeWidth="2" fill="none" transform="rotate(25 912.5 612.5)" opacity="0.6" />
        <path d="M 1100 620 L 1125 595 M 1125 620 L 1100 595" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />


        <rect x="600" y="640" width="28" height="28" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(22 614 654)" opacity="0.6" />
        <path d="M 1000 650 Q 1020 630, 1040 650" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />


        <circle cx="700" cy="670" r="10" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="2,2" opacity="0.6" />
        <path d="M 1100 680 L 1125 655 M 1125 680 L 1100 655" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />


        <circle cx="800" cy="690" r="16" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" />

        <circle cx="550" cy="710" r="15" stroke="#ec4899" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.6" />
        <path d="M 1050 720 Q 1070 700, 1090 720" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.6" />

        <circle cx="650" cy="740" r="13" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 1100 750 L 1125 725 M 1125 750 L 1100 725" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        <rect x="750" y="760" width="26" height="26" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(-21 763 773)" opacity="0.6" />
        <path d="M 1150 770 L 1175 745 L 1200 770 L 1185 800" stroke="#6366f1" strokeWidth="2" fill="none" opacity="0.6" />

        <path d="M 500 690 L 520 670 L 540 690 L 560 670 L 580 690" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 1000 730 L 1020 710 L 1040 730 L 1060 710 L 1080 730" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

        <path d="M 700 790 L 720 770 L 740 790 L 760 770" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 1100 660 L 1120 640 L 1140 660 L 1160 640" stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M 1150 720 L 1170 700 L 1190 720" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group cursor-pointer">
              <Image
                src="/nullboard.png"
                alt="Null Board"
                width={52}
                height={52}
                className="rounded-lg brightness-0 invert opacity-90"
              />
              <span className="text-2xl font-bold text-white tracking-wider">
                NULL BOARD
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs">
              Collaborative whiteboard for teams. Draw, share, and create together in real-time.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={social.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  aria-label={social.label}
                  className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white hover:text-white hover:bg-[#252525] hover:border-white/20 transition-all cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={22} />
                </motion.a>
              ))}
            </div>
          </div>

          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-left"
            >
              <h3 className="text-sm font-semibold text-white mb-5 tracking-wide uppercase">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.soon ? (
                      <span className="text-sm text-white/40 flex items-center gap-2">
                        {link.name}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 border border-white/10">Soon</span>
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1 group cursor-pointer"
                      >
                        {link.name}
                        {link.external && (
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Null Tools. All rights reserved.
          </p>

          <div className="hidden lg:block">
            <iframe
              src="https://status.nulltools.xyz/badge?theme=dark"
              width={250}
              height={30}
              frameBorder={0}
              scrolling="no"
              style={{ colorScheme: 'normal' }}
              className="rounded opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}