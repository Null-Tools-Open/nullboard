import { cn } from "@/lib/utils"

interface BetaBadgeProps {
    className?: string
    text?: string
}

export function BetaBadge({ className, text = "BETA" }: BetaBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded transition-transform duration-200",
                "bg-blue-500 text-white border border-blue-600 shadow-[0_2px_0_0_#1d4ed8]",
                "hover:translate-y-[2px] hover:shadow-none select-none cursor-default",
                className
            )}
        >
            {text}
        </span>
    )
}