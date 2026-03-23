import { ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">Comparing DeFi protocols with traditional banks worldwide</p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <a
              href="https://x.com/0xnico_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium"
            >
              nicoacosta.eth
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <span>Inspired by</span>
            <a
              href="https://aavevsbanks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400/60 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              aavevsbanks.com
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground/60 mt-2">For educational purposes only. Not financial advice.</p>
        </div>
      </div>
    </footer>
  )
}
