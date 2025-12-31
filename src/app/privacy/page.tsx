'use client'

import { motion } from 'framer-motion'
import { Footer } from '@/components/footer'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <rect x="8%" y="10%" width="100" height="70" stroke="#a855f7" strokeWidth="2" fill="none" transform="rotate(12 13% 15%)" opacity="0.4" />
        <circle cx="15%" cy="18%" r="22" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 10% 25% L 18% 22% L 14% 30% Z" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.4" />
        
        <rect x="82%" y="12%" width="90" height="65" stroke="#3b82f6" strokeWidth="2" fill="none" transform="rotate(-18 86.5% 17.5%)" opacity="0.4" />
        <circle cx="88%" cy="20%" r="18" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.5" />
        <path d="M 85% 28% L 91% 25% L 88% 32%" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.4" />
        
        <rect x="42%" y="8%" width="75" height="55" stroke="#ec4899" strokeWidth="2" fill="none" transform="rotate(8 45.75% 11.75%)" opacity="0.4" />
        <circle cx="48%" cy="15%" r="16" stroke="#ec4899" strokeWidth="2" fill="none" opacity="0.5" />
        
        <path d="M 18% 38% L 23% 35% L 28% 38% L 33% 35%" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <rect x="20%" y="41%" width="55" height="38" stroke="#eab308" strokeWidth="2" fill="none" transform="rotate(-3 23.75% 43%)" opacity="0.4" />
        
        <circle cx="72%" cy="42%" r="20" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="4,4" opacity="0.5" />
        <rect x="69%" y="47%" width="48" height="33" stroke="#10b981" strokeWidth="2" fill="none" transform="rotate(10 71% 48.5%)" opacity="0.4" />
        
        <path d="M 12% 58% Q 17% 53%, 22% 58% T 32% 58%" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.5" />
        <rect x="14%" y="61%" width="65" height="42" stroke="#f97316" strokeWidth="2" fill="none" transform="rotate(-6 17.25% 62%)" opacity="0.4" />
        
        <circle cx="58%" cy="68%" r="18" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.5" />
        <rect x="55%" y="73%" width="52" height="36" stroke="#ef4444" strokeWidth="2" fill="none" transform="rotate(13 57.5% 74.5%)" opacity="0.4" />
        
        <path d="M 78% 78% L 83% 75% L 88% 78% L 86% 83%" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.5" />
        <rect x="80%" y="81%" width="48" height="33" stroke="#14b8a6" strokeWidth="2" fill="none" transform="rotate(-8 82.5% 82.5%)" opacity="0.4" />
        
        <circle cx="33%" cy="83%" r="16" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="3,3" opacity="0.5" />
        <rect x="30%" y="88%" width="58" height="38" stroke="#6366f1" strokeWidth="2" fill="none" transform="rotate(6 33% 89%)" opacity="0.4" />
        
        <path d="M 13% 33% L 16% 31% M 16% 33% L 13% 31%" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M 68% 28% L 71% 26% M 71% 28% L 68% 26%" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M 38% 52% L 41% 50% M 41% 52% L 38% 50%" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M 63% 88% L 66% 86% M 66% 88% L 63% 86%" stroke="#10b981" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        
        <path d="M 23% 48% L 38% 48%" stroke="#eab308" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.3" />
        <path d="M 48% 63% L 63% 63%" stroke="#f97316" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.3" />
        <path d="M 28% 93% L 43% 93%" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.3" />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl" style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.5)'
            }} />

            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
              <div className="mb-8 relative">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wider">
                  PRIVACY POLICY
                </h1>
                <svg className="absolute left-0 -bottom-2 w-32 h-4 pointer-events-none opacity-40">
                  <path
                    d="M 5 2 Q 16 4, 32 2 T 64 2 T 96 2 T 127 2"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-white/40 mt-6">
                  Last Updated: 2025-11-23<br />
                  Effective Date: 2025-11-23
                </p>
              </div>

              <div className="space-y-8 text-white/70 leading-relaxed">
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">1. Introduction</h2>
                  <p className="mb-4">
                    This privacy policy ("Policy") describes how Null Tools ("Company", "Null Tools", "we", "us", "our") collects, uses, and shares personal information of users of our website, Null Board (https://nullboard.xyz) (the "Site"), as well as associated products and services (together, the "Services"). This Policy applies to personal information that we collect through the Site and our Services, as well as personal information you provide to us directly. This Policy also applies to any of our other websites and Services that post this Policy.
                  </p>
                  <p className="mb-4">
                    Please note that by using the Site or the Services, you accept the practices and policies described in this Policy and you consent that we will collect, use, and share your personal information as described below. If you do not agree to this Policy, please do not use the Site or the Services.
                  </p>
                  <p className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <strong className="text-white">Null Pass Account System:</strong> Your account is managed through Null Pass, our unified authentication system that enables you to use a single account across all Null applications, including Null Board, Null Mails, and Null Vault. When you create an account with Null Pass, you are creating an account that can be used across the entire Null ecosystem. If you delete your Null Pass account, your account and all associated data will be permanently deleted from all Null applications.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">2. Personal Information We Collect</h2>
                  <p className="mb-4">
                    We collect personal information about you in a number of different ways. When you use our Services, including our websites and Null Board, we collect personal information that you provide to us, which may include the following categories of personal information depending on how you use our Services and communicate with us:
                  </p>
                  
                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Personal Information From Users Of Null Board:</h3>
                  <p className="mb-4">When you use our Null Board product, we collect the following personal information from you:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li><strong className="text-white">User content:</strong> We do not store any user-generated content. All of your drawings, whiteboards, and collaborative content are stored in your browser's local storage and are not accessible to us. When you share whiteboards with others, the content is transmitted directly between users and is not stored on our servers.</li>
                    <li><strong className="text-white">Account information:</strong> Information you provide to us during registration and account management, such as your email address, password (stored in encrypted form), name, and profile settings.</li>
                    <li><strong className="text-white">Usage information:</strong> Information about how you use our Services, including whiteboard creation and collaboration activities, service interactions, and bandwidth usage.</li>
                    <li><strong className="text-white">Feedback and communications:</strong> Information you provide to us, such as feedback on the product, support requests, and other communications.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Personal Information From Users Of Our Websites Generally:</h3>
                  <p className="mb-4">When you use our Services, including our websites and Null Board, we collect personal information that you provide to us, which may include the following categories of personal information:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li><strong className="text-white">General identifiers:</strong> Your display name, email address, and account credentials for any of our Sites.</li>
                    <li><strong className="text-white">Online identifiers:</strong> Your username and passwords for any of our Sites, or information we automatically collect through cookies and similar technologies used on our websites. This may include your computer or mobile device's operating system type and version number, manufacturer and model, browser type, screen resolution, internet protocol (IP) address, unique identifier, the website you visited before browsing to our Site, and general location information such as city, state or geographic area.</li>
                    <li><strong className="text-white">Protected classification characteristics:</strong> Information that you choose to provide to us in communications with us or the Services, or that we collect in connection with providing our Services to you, including age, race, color, ancestry, national origin, citizenship, religion or creed, marital status, medical condition, physical or mental disability, sex, sexual orientation, veteran or military status or genetic information.</li>
                    <li><strong className="text-white">Commercial information:</strong> We store minimal subscription-related information, including your Polar customer ID, subscription ID, and subscription status. We do not store, process, or have access to your credit card numbers, billing addresses, or detailed payment information. All payment processing, including credit card information and billing addresses, is handled directly by Polar (Polar.sh), our payment processor. We only receive subscription status updates and identifiers from Polar through secure webhooks. We also collect information about your preferences regarding marketing communications.</li>
                    <li><strong className="text-white">Professional or employment-related information:</strong> Information that we collect in connection with providing our Services to you, such as your job title, employer information and work history.</li>
                    <li><strong className="text-white">Other information you provide to us:</strong> Any additional personal information you choose to provide to us through various means of communication.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Personal Information We Get From Others:</h3>
                  <p className="mb-4">
                    We may collect personal information about you from other sources. We may add this to information we collect from this Site and through our Services.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Information We Collect Automatically:</h3>
                  <p className="mb-4">
                    We automatically log information about you and your computer, phone, tablet, or other devices you use to access the Site and Services. For example, when visiting our Site or the Services, we may log your computer or device identification, operating system type, browser type, browser language, the website you visited before browsing to our Site or the Services, pages you viewed, how long you spent on a page, access times and information about your use of and actions on our Site or the Services. How much of this information we collect depends on the type and settings of the device you use to access the Site and Services.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Cookies:</h3>
                  <p className="mb-4">
                    We may log information using "cookies." Cookies are small data files stored on your hard drive by a website. We may use both session Cookies (which expire once you close your web browser) and persistent Cookies (which stay on your computer until you delete them) to provide you with a more personal and interactive experience on our Site. Other similar tools we may use to collect information by automated means include web server logs, web beacons and pixel tags. This type of information is collected to make the Site and Services more useful to you and to tailor the experience with us to meet your interests and needs.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Analytics Information:</h3>
                  <p className="mb-4">
                    We may use analytics tools to help analyze how users use the Site and the Services. These analytics services use Cookies to collect information such as how often users visit the Site or use the Services, what pages they visit, whiteboard creation and collaboration patterns, and what other sites they used prior to coming to the Site. We use the information we get from use of these analytics services only to improve our Site and the Services. Analytics services drop persistent Cookies on your web browser to identify you as a unique user the next time you visit the Site or use the Services.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Additional Information:</h3>
                  <p className="mb-4">
                    If you choose to interact on the Site or through the Services (such as by registering; using our Services; entering into agreements with us; or requesting information from us), we will collect the personal information that you provide. We may collect personal information about you that you provide through telephone, email, or other communications. If you provide us with personal information regarding another individual, please do not do so unless you have that person's consent to give us their personal information.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">3. How We Use Your Personal Information</h2>
                  <p className="mb-4">
                    Subject to this Privacy Policy, our terms of use, and applicable terms and conditions of third-party applications, all data transmitted through the Site and the Services is owned by Null Tools. Generally, we may use information in the following ways and as otherwise described in this Privacy Policy:
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">To Provide the Services and Personalize Your Experience:</h3>
                  <p className="mb-4">We use personal information about you to provide the Services to you, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li>To help establish and verify your identity;</li>
                    <li>For the purposes for which you specifically provided it to us, including, without limitation, to enable us to process and fulfill your requests or provide the Services to you;</li>
                    <li>To process subscription payments through Polar (Polar.sh), our payment processor. We share only your email address and display name with Polar to create your customer account. All payment information, including credit card details and billing addresses, is processed directly by Polar and never stored on our servers;</li>
                    <li>To provide you with effective customer service;</li>
                    <li>To provide you with a personalized experience when you use the Site or by delivering relevant Site content;</li>
                    <li>To send you information about your relationship or transactions with us;</li>
                    <li>To otherwise contact you with information that we believe will be of interest to you, including marketing and promotional communications; and</li>
                    <li>To enhance or develop features, products or services.</li>
                  </ul>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Research and Development:</h3>
                  <p className="mb-4">
                    We may use your general identifiers, online identifiers, internet activity information and commercial information for research and development purposes, including to analyze and improve the Services, our Sites and our business. As part of these activities, we may create aggregated, de-identified or other anonymous data from personal information we collect. We make personal information into anonymous data by removing information that makes the data personally identifiable to you. We may use this anonymous data and share it with third parties for our lawful business purposes.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Training of AI Models:</h3>
                  <p className="mb-4">
                    <strong className="text-white">We do not use your personal information, User Content, or any data from your whiteboards to train, develop, or improve AI models, machine learning algorithms, or any artificial intelligence systems.</strong>
                  </p>
                  <p className="mb-4">
                    This commitment applies to all types of data we may have access to, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li>Your drawings, sketches, diagrams, and any visual content created on whiteboards</li>
                    <li>Text, annotations, and notes added to whiteboards</li>
                    <li>Account information, usage patterns, and behavioral data</li>
                    <li>Any metadata associated with your whiteboards or account</li>
                    <li>Communications, feedback, or support requests</li>
                  </ul>
                  <p className="mb-4">
                    We respect your privacy and intellectual property rights. Your creative work, collaborative content, and personal data remain yours and are never used for AI training purposes, regardless of whether your whiteboards are private, shared, or public. This policy ensures that your ideas, designs, and sensitive information are protected and will not be incorporated into any AI systems or models.
                  </p>
                  <p className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <strong className="text-white">Your Privacy Matters:</strong> We believe that your creative work and personal data should never be used to train AI without your explicit consent. This commitment is fundamental to our privacy practices and will not change without clear, prior notice to all users.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Marketing:</h3>
                  <p className="mb-4">
                    We may use your general identifiers, online identifiers, internet activity information and commercial information in connection with sending you marketing communications as permitted by law, including by mail and email. You may opt-out of marketing communications by following the unsubscribe instructions in marketing emails, or by emailing us at contact@nulltools.xyz.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Compliance and Protection:</h3>
                  <p className="mb-4">We may use any of the categories of personal information described above to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li>Comply with applicable laws, lawful requests, and legal process, such as to respond to subpoenas or requests from government authorities.</li>
                    <li>Protect our, your and others' rights, privacy, safety and property (including by making and defending legal claims).</li>
                    <li>Audit our internal processes for compliance with legal and contractual requirements and internal policies.</li>
                    <li>Enforce the terms and conditions that govern the Site and our Services.</li>
                    <li>Prevent, identify, investigate and deter fraudulent, harmful, unauthorized, unethical or illegal activity, including cyberattacks and identity theft.</li>
                  </ul>
                  <p>
                    We may also use personal information for other purposes consistent with this Privacy Policy or that are explained to you at the time of collection of your personal information.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">4. How We Share Your Personal Information</h2>
                  <p className="mb-4">
                    We may disclose all categories of personal information described above with the following categories of third parties:
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Affiliates:</h3>
                  <p className="mb-4">
                    We may share your personal information with our affiliates, for purposes consistent with this notice or that operate shared infrastructure, systems and technology.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Third Party Service Providers:</h3>
                  <p className="mb-4">
                    We may provide your personal information to third-party service providers that help us provide you with the Services that we offer through the Site or otherwise, and to operate our business. Our third-party service providers with whom we may share your personal information include, but are not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li><strong className="text-white">Cloudflare.</strong> We use Cloudflare to help us with hosting, content delivery network (CDN) services, and security. You can view the Cloudflare privacy statement here: <a href="https://www.cloudflare.com/privacypolicy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors underline">https://www.cloudflare.com/privacypolicy</a></li>
                    <li><strong className="text-white">Neon (Neon.tech).</strong> We use Neon to host and manage our PostgreSQL database, which stores your account information, whiteboard metadata (such as whiteboard names and sharing settings), and other service data. You can view the Neon privacy policy here: <a href="https://neon.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors underline">https://neon.tech/legal/privacy-policy</a></li>
                    <li><strong className="text-white">Polar (Polar.sh).</strong> We use Polar as our payment processor for all subscription payments. Polar handles all payment processing, including credit card information, billing addresses, payment methods, and transaction details. Polar is PCI DSS compliant and processes all payments securely. We only share your email address and display name (if provided) with Polar to create your customer account. Polar stores and processes all billing and payment information according to their privacy policy. We receive only subscription status updates and identifiers (customer ID, subscription ID) from Polar through secure webhooks. You can view the Polar privacy policy here: <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors underline">https://polar.sh/legal/privacy</a></li>
                  </ul>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Professional Advisors:</h3>
                  <p className="mb-4">
                    We may provide your personal information to our lawyers, accountants, bankers and other outside professional advisors in the course of the services they provide to us.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Corporate Restructuring:</h3>
                  <p className="mb-4">
                    We may share some or all of your personal information in connection with or during negotiation of any merger, financing, acquisition or dissolution, transaction or proceeding involving the sale, transfer, divestiture, or disclosure of all or a portion of our business or assets. In the event of an insolvency, bankruptcy, or receivership, personal information may also be transferred as a business asset. If another company acquires Null Tools, our business, or assets, that company will possess the personal information collected by us and will assume the rights and obligations regarding your personal information described in this Privacy Policy.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Other Disclosures:</h3>
                  <p className="mb-4">We may disclose your personal information if we believe in good faith that such disclosure is necessary for any of the following:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4 text-white/60">
                    <li>In connection with any legal investigation;</li>
                    <li>To comply with relevant laws or to respond to subpoenas or warrants served on us;</li>
                    <li>To protect or defend the rights or property of Null Tools or users of the Site or Services; and/or</li>
                    <li>To investigate or assist in preventing any violation or potential violation of the law, this Privacy Policy, or our terms of service/terms of use.</li>
                  </ul>
                  <p className="mb-4">
                    We may also share personal information with other categories of third parties with your consent or as described to you at the time of collection of your personal information.
                  </p>
                  <p className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <strong className="text-white">We do not sell your personal information.</strong>
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Third Party Websites:</h3>
                  <p className="mb-4">
                    Our Site or the Services may contain links to third party websites or services. When you click on a link to any other website or location, you will leave our Site or the Services and go to another site and another entity may collect your personal information from you. We have no control over, do not review, and cannot be responsible for these outside websites or their content, or any collection of your personal information after you click on links to such outside websites. The links to third party websites or locations are for your convenience and do not signify our endorsement of such third parties or their products, content, websites or privacy practices.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">5. Your Choices Regarding Your Personal Information</h2>
                  <p className="mb-4">
                    You have several choices regarding the use of your personal information on the Site and our Services:
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Email Communications:</h3>
                  <p className="mb-4">
                    We do not send newsletters or promotional emails. We only send you Service-related communications that are necessary for the operation of your account and the Services, including but not limited to: account verification, password resets, subscription status updates, security notifications, and notices of any updates to our Privacy Policy or terms of service/terms of use. These communications are essential for the proper functioning of the Services and cannot be opted out of.
                  </p>

                  <h3 className="text-xl font-bold text-white mb-3 mt-6 tracking-wide">Cookies:</h3>
                  <p className="mb-4">
                    If you decide at any time that you no longer wish to accept cookies from our Site for any of the purposes described above, then you can instruct your browser, by changing its settings, to stop accepting cookies or to prompt you before accepting a cookie from the websites you visit. Consult your browser's technical information. If you do not accept cookies, however, you may not be able to use all portions of the Site or all functionality of the Services. If you have any questions about how to disable or modify cookies, visit <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors underline">https://www.allaboutcookies.org/</a>.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">6. Security Of Your Personal Information</h2>
                  <p className="mb-4">
                    Null Tools is committed to protecting the security of your personal information. We use a variety of security technologies and procedures to help protect your personal information from unauthorized access, use, or disclosure. No method of transmission over the internet, or method of electronic storage, is 100% secure, however. Therefore, while we use reasonable efforts to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">7. International Users</h2>
                  <p className="mb-4">
                    Please note that our Site and the Services are provided from Poland. As such, they are governed by the laws of Poland. If you use our Site or our Services, your personal information will be subject to Polish law and may be processed in Poland or in other countries where our service providers operate.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">8. Children</h2>
                  <p className="mb-4">
                    Our Site and the Services are not intended for children under 13 years of age, and you must be at least 13 years old to have our permission to use the Site or the Services. We do not knowingly collect, use, or disclose personally identifiable information from children under 13. If you believe that we have collected, used, or disclosed personally identifiable information of a child under the age of 13, please contact us using the contact information below so that we can take appropriate action.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">9. Do Not Track</h2>
                  <p className="mb-4">
                    We currently do not support the Do Not Track browser setting or respond to Do Not Track signals. Do Not Track (or DNT) is a preference you can set in your browser to let the websites you visit know that you do not want them collecting certain information about you. For more details about Do Not Track, including how to enable or disable this preference, visit <a href="https://www.allaboutdnt.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors underline">https://www.allaboutdnt.com</a>.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">10. Updates To This Privacy Policy</h2>
                  <p className="mb-4">
                    We reserve the right to change this Privacy Policy at any time. If we make any material changes to this Privacy Policy, we will post the revised version to our website and update the "Effective Date" at the top of this Privacy Policy. Except as otherwise indicated, any changes will become effective when we post the revised Privacy Policy on our website.
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">11. Contact Us</h2>
                  <p className="mb-4">
                    Our contact information is as follows:
                  </p>
                  <p className="ml-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    Null Tools<br />
                    Email: <a href="mailto:legal@nulltools.xyz" className="text-white hover:text-white/80 transition-colors underline">legal@nulltools.xyz</a><br />
                    Email: <a href="mailto:contact@nulltools.xyz" className="text-white hover:text-white/80 transition-colors underline">contact@nulltools.xyz</a>
                  </p>
                  <p className="mt-4">
                    If you have questions about this Privacy Policy or our privacy practices, please contact us using the email addresses above.
                  </p>
                </motion.section>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}