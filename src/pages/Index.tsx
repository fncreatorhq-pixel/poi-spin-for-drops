import MysteryWheel from '@/components/MysteryWheel';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--secondary)/0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary text-glow mb-3">
            MYSTERY WHEEL
          </h1>
          <p className="text-lg md:text-xl font-body text-muted-foreground">
            Fortnite Chapter 7 Season 1 — Pacific Break
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-accent font-body">
            <span>🎮</span>
            <span className="text-sm uppercase tracking-wider">Random Drop Selector</span>
            <span>📍</span>
          </div>
        </header>

        {/* Wheel Section */}
        <main className="flex justify-center">
          <MysteryWheel />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-muted-foreground/60 text-sm font-body">
            Press the button and land wherever fate decides! 🪂
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
