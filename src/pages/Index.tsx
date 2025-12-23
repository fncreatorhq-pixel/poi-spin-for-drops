import MysteryWheel from '@/components/MysteryWheel';
import nordvpnLogo from '@/assets/nordvpn-logo.png';

const Index = () => {
  return (
    <div className="h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--secondary)/0.1),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-4 py-4">
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

        {/* NordVPN Banner */}
        <div className="mt-2 flex justify-center px-2">
          <a 
            href="https://nordvpn.sjv.io/c/6550207/742889/7452" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group w-full max-w-[728px] h-[90px] bg-gradient-to-r from-[hsl(220,80%,20%)] via-[hsl(240,70%,25%)] to-[hsl(260,60%,30%)] border border-primary/30 rounded-lg flex items-center justify-between px-6 overflow-hidden relative hover:scale-[1.02] transition-transform duration-300"
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* NordVPN Logo */}
            <div className="flex-shrink-0 relative z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/30 p-1.5">
                <img src={nordvpnLogo} alt="NordVPN" className="w-full h-full object-contain" />
              </div>
            </div>
            
            {/* Text content */}
            <div className="flex-1 text-center px-4 relative z-10">
              <p className="text-white font-display text-sm md:text-lg font-bold leading-tight">
                Stop second guessing yourself.
              </p>
              <p className="text-[hsl(200,100%,70%)] font-body text-xs md:text-sm mt-0.5">
                NordVPN works holidays as well. 🎄
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex-shrink-0 relative z-10 flex items-center gap-2 md:gap-3">
              <span className="text-[hsl(45,100%,60%)] font-display font-bold text-xs md:text-sm whitespace-nowrap">
                Save 80%
              </span>
              <div className="bg-gradient-to-r from-[hsl(160,100%,40%)] to-[hsl(180,100%,35%)] text-white font-display font-bold text-xs md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-lg shadow-[hsl(160,100%,40%)]/30 group-hover:shadow-[hsl(160,100%,40%)]/50 transition-shadow duration-300">
                Get Deal →
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
