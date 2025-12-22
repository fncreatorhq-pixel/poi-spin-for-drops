import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POIS = [
  { name: 'Latte Landing', color: 'hsl(190, 100%, 45%)' },
  { name: 'Wonkeeland', color: 'hsl(320, 100%, 55%)' },
  { name: 'Tiptop Terrace', color: 'hsl(25, 100%, 50%)' },
  { name: 'Painted Palms', color: 'hsl(150, 100%, 45%)' },
  { name: 'Bumpy Bay', color: 'hsl(280, 100%, 55%)' },
  { name: 'Innoloop Labs', color: 'hsl(50, 100%, 50%)' },
  { name: 'Sandy Strip', color: 'hsl(35, 100%, 55%)' },
  { name: 'Fore Fields', color: 'hsl(120, 80%, 45%)' },
  { name: 'Humble Hills', color: 'hsl(200, 100%, 50%)' },
  { name: 'Ripped Tides', color: 'hsl(340, 100%, 55%)' },
  { name: 'Sus Studios', color: 'hsl(0, 100%, 50%)' },
  { name: 'Battlewood Blvd', color: 'hsl(260, 100%, 55%)' },
  { name: 'Classified Canyon', color: 'hsl(170, 100%, 45%)' },
];

const MysteryWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const segmentAngle = 360 / POIS.length;

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowResult(false);
    setSelectedPOI(null);

    // Pick a random segment to land on
    const randomSegment = Math.floor(Math.random() * POIS.length);
    
    // Random spins between 5-10 full rotations
    const spins = 5 + Math.random() * 5;
    
    // Calculate rotation needed to land on the chosen segment
    // Segments are drawn starting at -90° (top), going clockwise
    // When wheel rotates clockwise by X degrees, segment at top was originally at position -X
    // To get segment N at the top: rotate by (N * segmentAngle) + offset to center of segment
    const targetRotation = randomSegment * segmentAngle + segmentAngle / 2;
    const totalRotation = rotation + spins * 360 + targetRotation;
    
    setRotation(totalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedPOI(POIS[randomSegment].name);
      setShowResult(true);
    }, 5000);
  };

  const createWheelSegments = () => {
    return POIS.map((poi, index) => {
      const startAngle = index * segmentAngle - 90;
      const endAngle = startAngle + segmentAngle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = 50 + 50 * Math.cos(startRad);
      const y1 = 50 + 50 * Math.sin(startRad);
      const x2 = 50 + 50 * Math.cos(endRad);
      const y2 = 50 + 50 * Math.sin(endRad);
      
      const largeArc = segmentAngle > 180 ? 1 : 0;
      
      const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      // Text position - radial (along the segment)
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = 32;
      const textX = 50 + textRadius * Math.cos(midRad);
      const textY = 50 + textRadius * Math.sin(midRad);
      
      return (
        <g key={poi.name}>
          <path
            d={pathD}
            fill={poi.color}
            stroke="hsl(230, 25%, 15%)"
            strokeWidth="0.5"
            className="transition-all duration-300"
          />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize="2.6"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
            style={{ 
              fontFamily: 'Orbitron, sans-serif',
              textShadow: '0 0 3px rgba(0,0,0,0.8)',
              letterSpacing: '0.02em'
            }}
          >
            {poi.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative flex flex-col items-center gap-8">
      {/* Wheel Container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-xl animate-pulse" />
        
        {/* Wheel border */}
        <div className="relative w-[400px] h-[400px] rounded-full p-2 bg-gradient-to-br from-primary/50 via-secondary/50 to-accent/50 box-glow">
          <div className="w-full h-full rounded-full bg-card p-1">
            {/* The spinning wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full overflow-hidden transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '5s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {createWheelSegments()}
                {/* Center circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="8"
                  fill="hsl(230, 25%, 12%)"
                  stroke="hsl(190, 100%, 50%)"
                  strokeWidth="1"
                />
                <text
                  x="50"
                  y="50"
                  fill="hsl(190, 100%, 50%)"
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  FN
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-accent drop-shadow-lg" 
               style={{ filter: 'drop-shadow(0 0 10px hsl(25, 100%, 55%))' }} />
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`
          relative px-12 py-6 rounded-full font-display text-2xl font-bold uppercase tracking-wider
          bg-gradient-to-br from-destructive to-red-700 text-destructive-foreground
          transition-all duration-300 transform
          ${isSpinning 
            ? 'opacity-50 cursor-not-allowed scale-95' 
            : 'hover:scale-105 active:scale-95 animate-pulse-glow cursor-pointer'}
        `}
      >
        <span className="relative z-10 drop-shadow-lg">
          {isSpinning ? 'Spinning...' : '🎯 SPIN TO DROP'}
        </span>
        {!isSpinning && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/20" />
        )}
      </button>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && selectedPOI && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-br from-card to-muted p-8 rounded-2xl border border-primary/50 box-glow text-center max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-muted-foreground font-body text-lg mb-2">You're dropping at:</p>
              <h2 className="text-4xl font-display font-bold text-primary text-glow mb-4">
                {selectedPOI}
              </h2>
              <p className="text-6xl mb-4">🪂</p>
              <button
                onClick={() => setShowResult(false)}
                className="px-6 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded-lg font-body text-lg text-primary transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POI List */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
        {POIS.map((poi) => (
          <div
            key={poi.name}
            className="px-3 py-2 rounded-lg text-sm font-body flex items-center gap-2 bg-muted/50 border border-border hover:border-primary/50 transition-all"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: poi.color }}
            />
            <span className="text-foreground/80 truncate">{poi.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MysteryWheel;
