import MysteryWheel from '@/components/MysteryWheel';

const Index = () => {
  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--secondary)/0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex">
        {/* Left Ad Space */}
        <aside className="hidden lg:flex w-[160px] flex-shrink-0 items-center justify-center p-2">
          <div className="w-full h-[600px] max-h-[80vh] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground/40 text-xs font-body uppercase tracking-wider [writing-mode:vertical-lr] rotate-180">
              Ad Space
            </span>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col px-4 py-4">
          {/* Header */}
          <header className="text-center mb-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary text-glow mb-1">
              MYSTERY WHEEL
            </h1>
            <p className="text-sm md:text-base font-body text-muted-foreground">
              Fortnite Chapter 7 Season 1 — Pacific Break
            </p>
          </header>

          {/* Wheel Section */}
          <main className="flex-1 flex items-center justify-center min-h-0">
            <MysteryWheel />
          </main>

          {/* Bottom Ad Space */}
          <div className="mt-2 flex justify-center">
            <div className="w-full max-w-[728px] h-[90px] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground/40 text-xs font-body uppercase tracking-wider">
                Ad Space (728x90)
              </span>
            </div>
          </div>
        </div>

        {/* Right Ad Space */}
        <aside className="hidden lg:flex w-[160px] flex-shrink-0 items-center justify-center p-2">
          <div className="w-full h-[600px] max-h-[80vh] bg-muted/30 border border-border/50 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground/40 text-xs font-body uppercase tracking-wider [writing-mode:vertical-lr]">
              Ad Space
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
