export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              <defs>
                <linearGradient id="defi-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="50%" stopColor="#d946ef" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="16" fill="url(#defi-gradient)" />
              <path d="M14 20L20 14L26 20L20 26L14 20Z" className="fill-background" />
            </svg>
          </div>
          <span className="text-lg md:text-xl font-semibold tracking-tight">
            DeFi <span className="text-muted-foreground font-normal">vs</span> Banks
          </span>
        </div>
      </div>
    </header>
  )
}
