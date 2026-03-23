export function LoadingTable() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-secondary rounded mb-2" />
          <div className="h-4 w-96 bg-secondary rounded mb-8" />

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="p-4 border-b border-border">
              <div className="h-10 bg-secondary rounded" />
            </div>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
                <div className="h-4 w-8 bg-secondary rounded" />
                <div className="h-8 w-8 bg-secondary rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-48 bg-secondary rounded mb-2" />
                  <div className="h-3 w-32 bg-secondary rounded" />
                </div>
                <div className="h-4 w-24 bg-secondary rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
