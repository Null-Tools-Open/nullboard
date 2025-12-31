// Custom icons used across the app 

const DiscordIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className || "text-text-secondary hover:text-text-primary transition-colors"}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const CookieIcon = ({ size = 40 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-text-primary"
  >
    <path d="M24 4c1.6 0 3 .9 3.7 2.3.7 1.3 2.2 2 3.6 1.7 1.6-.4 3.3.4 4 1.9.7 1.4 2.3 2.2 3.8 1.8 1.7-.4 3.4.6 3.9 2.3.5 1.6-.2 3.3-1.7 4.1-1.4.7-2.1 2.3-1.7 3.8.4 1.5-.3 3.1-1.7 3.8-1.4.7-2.1 2.3-1.7 3.8.4 1.5-.3 3.1-1.7 3.8-1.4.7-3.1.1-3.9-1.2-.8-1.3-2.5-1.8-3.9-1.1-1.4.7-3.1.2-3.9-1.1-.8-1.3-2.5-1.8-3.9-1.1-1.4.7-3.1.2-3.9-1.1-.8-1.3-2.5-1.8-3.9-1.1-1.4.7-3.1.2-3.9-1.1-.8-1.3-.3-3.1 1.1-3.9 1.4-.8 1.9-2.5 1.2-3.9-.7-1.4-.2-3.1 1.2-3.9 1.4-.8 1.9-2.5 1.2-3.9C9.1 9 10.3 7 12.4 6.6 13.9 6.3 15 5 15 3.5V3.4C15.8 3 16.8 2.8 18 2.8c1.7 0 3.3.5 4.7 1.2C22.9 4.1 23.4 4 24 4Z" fill="currentColor" opacity=".15" />
    <path d="M24 42c9.9 0 18-8.1 18-18 0-.4 0-.8-.1-1.2-1.6.2-3.2-.7-3.8-2.2-.7-1.7-2.5-2.6-4.2-2.2-1.8.4-3.6-.6-4.2-2.3-.6-1.5-2.1-2.5-3.8-2.3-1.9.3-3.6-1.1-3.9-3-.2-1.1-.9-2-1.9-2.5C12.3 10.6 6 17 6 24c0 9.9 8.1 18 18 18Z" fill="currentColor" />
    <circle cx="18" cy="20" r="2" fill="#111111" />
    <circle cx="28" cy="26" r="3" fill="#111111" />
    <circle cx="22" cy="30" r="1.8" fill="#111111" />
  </svg>
)

const X = ({ size = 22, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LaserPointerIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 3 L20 5 L8 17 L6 15 Z" fill="currentColor" opacity="0.3" />
    <line x1="18" y1="3" x2="20" y2="5" />
    <line x1="20" y1="5" x2="8" y2="17" />
    <line x1="8" y1="17" x2="6" y2="15" />
    <line x1="6" y1="15" x2="18" y2="3" />

    <line x1="6" y1="15" x2="3" y2="18" strokeWidth="1.5" opacity="0.6" />
    <line x1="3" y1="18" x2="2" y2="19" strokeWidth="1" opacity="0.4" />

    <circle cx="2" cy="19" r="2" fill="red" opacity="0.7" stroke="none" />
    <circle cx="2" cy="19" r="3" fill="red" opacity="0.2" stroke="none" />

    <circle cx="13" cy="9" r="1" fill="currentColor" />
  </svg>
);

export { DiscordIcon, CookieIcon, X, LaserPointerIcon }