import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TwitchChatClient } from '@/lib/twitchChat';

type WheelType = 'pois' | 'reload' | 'colors';
type ReloadMap = 'venture' | 'oasis' | 'slurp';
type ChatState = 'closed' | 'collecting';
type PoiMode = 'idle' | 'collecting' | 'ready';

// Current BR season: Chapter 7 Season 3 "Runners" (2026)
const CURRENT_SEASON_POIS = [
  'Wonkeeland',
  'Latte Landing',
  'Lifty Lodge',
  'Battlewoods',
  'Chopped Shop',
  'Calamari Canyon',
  'Frosted Flats',
  'Golden Grove',
  'Shaken Sanctuary',
  'Cluster Coast',
  'Sunken Shores',
  'Sinister Strip',
  'Heatwave Harbor',
];

// Fortnite Reload named locations, per current rotation
const RELOAD_POIS: Record<ReloadMap, { label: string; emoji: string; pois: string[] }> = {
  venture: {
    label: 'Venture (OG)',
    emoji: '🏙️',
    pois: [
      'Tilted Towers',
      'Retail Row',
      'Pleasant Park',
      'Lazy Laps',
      'Dusty Docks',
      'Lil’Loot Lake',
      'Sandy Sheets',
      'Lone Lodge',
      'Snobby Shoals',
    ],
  },
  oasis: {
    label: 'Oasis (Desert)',
    emoji: '🌵',
    pois: [
      'Snobby Sands',
      'Lizard Links',
      'Fossil Fields',
      'Adobe Abodes',
      'Guaco Town',
      'Shady Springs',
      'Paradise Palms',
      'Sunburnt Shafts',
      'Twisted Trailers',
    ],
  },
  slurp: {
    label: 'Slurp Rush',
    emoji: '🥤',
    pois: [
      'Slurpy Swamp',
      'Steamy Stacks',
      'Dirty Docks',
      'Boomin Base',
      'Lockdown Lighthouse',
      'Fort Crumpet',
      'Stilt Town',
      'Logjam Logging',
    ],
  },
};

const PALETTE = [
  'hsl(190, 100%, 45%)',
  'hsl(320, 100%, 55%)',
  'hsl(25, 100%, 50%)',
  'hsl(150, 100%, 45%)',
  'hsl(280, 100%, 55%)',
  'hsl(50, 100%, 50%)',
  'hsl(35, 100%, 55%)',
  'hsl(120, 80%, 45%)',
  'hsl(200, 100%, 50%)',
  'hsl(340, 100%, 55%)',
  'hsl(0, 100%, 50%)',
  'hsl(260, 100%, 55%)',
  'hsl(170, 100%, 45%)',
];

const PLACEHOLDER_COLOR = 'hsl(230, 15%, 30%)';
const TIMER_SECONDS = 300; // 5 minutes
const COMMAND = '!drop';

const COLORS = [
  { name: 'Gray', color: 'hsl(0, 0%, 70%)' },
  { name: 'Green', color: 'hsl(120, 70%, 45%)' },
  { name: 'Blue', color: 'hsl(210, 100%, 50%)' },
  { name: 'Purple', color: 'hsl(270, 70%, 55%)' },
  { name: 'Gold', color: 'hsl(45, 100%, 50%)' },
  { name: 'Mythic', color: 'hsl(35, 100%, 55%)' },
];

type Slot = { name: string; color: string; user?: string; placeholder?: boolean };

const buildEmptySlots = (count: number): Slot[] =>
  Array.from({ length: count }, () => ({
    name: '???',
    color: PLACEHOLDER_COLOR,
    placeholder: true,
  }));

const buildDefaultSlots = (pool: string[]): Slot[] =>
  pool.map((name, i) => ({ name, color: PALETTE[i % PALETTE.length] }));

const MysteryWheel = () => {
  const [wheelType, setWheelType] = useState<WheelType>('pois');
  const [reloadMap, setReloadMap] = useState<ReloadMap>('venture');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [bonusColor, setBonusColor] = useState<{ name: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Chat integration state
  const [twitchChannel, setTwitchChannel] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('twitchChannel') || '' : ''),
  );
  const [channelInput, setChannelInput] = useState(twitchChannel);
  const [chatState, setChatState] = useState<ChatState>('closed');
  const [poiMode, setPoiMode] = useState<PoiMode>('idle');
  const [poiSlots, setPoiSlots] = useState<Slot[]>(() => buildDefaultSlots(CURRENT_SEASON_POIS));
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [twitchStatus, setTwitchStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const chatClientRef = useRef<TwitchChatClient | null>(null);
  const timerRef = useRef<number | null>(null);
  const suggestionsRef = useRef<Slot[]>([]);

  const isChatWheel = wheelType === 'pois' || wheelType === 'reload';
  const activePool = useMemo<string[]>(() => {
    if (wheelType === 'reload') return RELOAD_POIS[reloadMap].pois;
    return CURRENT_SEASON_POIS;
  }, [wheelType, reloadMap]);
  const totalSlots = activePool.length;

  const items: Slot[] =
    wheelType === 'colors' ? COLORS.map((c) => ({ ...c })) : poiSlots;
  const segmentAngle = 360 / items.length;

  const stopTwitch = useCallback(() => {
    chatClientRef.current?.disconnect();
    chatClientRef.current = null;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetSlotsToDefault = useCallback(() => {
    setPoiSlots(buildDefaultSlots(activePool));
  }, [activePool]);

  // Whenever wheel selection changes while idle, reset the board
  useEffect(() => {
    if (poiMode === 'idle' && !isSpinning) {
      if (isChatWheel) setPoiSlots(buildDefaultSlots(activePool));
      setSelectedItem(null);
      setShowResult(false);
      setRotation(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelType, reloadMap]);

  const closeCollection = useCallback(() => {
    stopTwitch();
    stopTimer();
    // Autofill remaining slots with POIs not already suggested from the active pool
    const used = new Set(
      suggestionsRef.current.map((s) => s.name.toLowerCase().trim()),
    );
    const pool = activePool.filter((p) => !used.has(p.toLowerCase()));
    const filled: Slot[] = [...suggestionsRef.current];
    let poolIdx = 0;
    while (filled.length < totalSlots && poolIdx < pool.length) {
      filled.push({
        name: pool[poolIdx],
        color: PALETTE[filled.length % PALETTE.length],
      });
      poolIdx++;
    }
    while (filled.length < totalSlots) {
      filled.push({ name: '???', color: PLACEHOLDER_COLOR, placeholder: true });
    }
    setPoiSlots(filled);
    setChatState('closed');
    setPoiMode('ready');
  }, [stopTwitch, stopTimer, activePool, totalSlots]);

  const startCollection = useCallback(() => {
    if (!twitchChannel) return;
    stopTwitch();
    stopTimer();
    suggestionsRef.current = [];
    setPoiSlots(buildEmptySlots(totalSlots));
    setSelectedItem(null);
    setShowResult(false);
    setRotation(0);
    setTimeLeft(TIMER_SECONDS);
    setChatState('collecting');
    setPoiMode('collecting');

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.setTimeout(() => closeCollection(), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const poolSnapshot = activePool;
    const totalSnapshot = totalSlots;
    const client = new TwitchChatClient(
      twitchChannel,
      (username, message) => {
        const trimmed = message.trim();
        if (!trimmed.toLowerCase().startsWith(COMMAND)) return;
        const suggestion = trimmed.substring(COMMAND.length).trim();
        if (!suggestion) return;
        const matched = poolSnapshot.find(
          (p) => p.toLowerCase() === suggestion.toLowerCase(),
        );
        if (!matched) return;
        const existing = suggestionsRef.current;
        if (existing.length >= totalSnapshot) return;
        if (existing.some((s) => s.user?.toLowerCase() === username.toLowerCase())) return;
        if (existing.some((s) => s.name.toLowerCase() === matched.toLowerCase())) return;
        const nextIndex = existing.length;
        const newSlot: Slot = {
          name: matched,
          color: PALETTE[nextIndex % PALETTE.length],
          user: username,
        };
        suggestionsRef.current = [...existing, newSlot];
        setPoiSlots(() => {
          const slots = buildEmptySlots(totalSnapshot);
          suggestionsRef.current.forEach((s, i) => (slots[i] = s));
          return slots;
        });
      },
      (status) => setTwitchStatus(status),
    );
    chatClientRef.current = client;
    client.connect();
  }, [twitchChannel, stopTwitch, stopTimer, closeCollection, activePool, totalSlots]);

  const cancelCollection = useCallback(() => {
    stopTwitch();
    stopTimer();
    suggestionsRef.current = [];
    resetSlotsToDefault();
    setChatState('closed');
    setPoiMode('idle');
    setTimeLeft(TIMER_SECONDS);
  }, [stopTwitch, stopTimer, resetSlotsToDefault]);

  useEffect(() => {
    return () => {
      stopTwitch();
      stopTimer();
    };
  }, [stopTwitch, stopTimer]);

  const handleWheelChange = (value: WheelType) => {
    if (isSpinning || chatState === 'collecting') return;
    setWheelType(value);
    setRotation(0);
    setSelectedItem(null);
    setShowResult(false);
    setPoiMode('idle');
    suggestionsRef.current = [];
  };

  const handleReloadMapChange = (value: ReloadMap) => {
    if (isSpinning || chatState === 'collecting') return;
    setReloadMap(value);
    setPoiMode('idle');
    suggestionsRef.current = [];
  };

  const saveChannel = () => {
    const clean = channelInput.trim().replace(/^#/, '');
    if (!clean) return;
    localStorage.setItem('twitchChannel', clean);
    setTwitchChannel(clean);
  };

  const spin = () => {
    if (isSpinning || chatState === 'collecting') return;
    if (items.some((i) => i.placeholder)) return;

    setIsSpinning(true);
    setShowResult(false);
    setSelectedItem(null);

    const randomSegment = Math.floor(Math.random() * items.length);
    const spins = Math.floor(5 + Math.random() * 5);
    const normalize360 = (deg: number) => ((deg % 360) + 360) % 360;
    const targetNormalized = normalize360(360 - (randomSegment + 0.5) * segmentAngle);
    const currentNormalized = normalize360(rotation);
    let additionalRotation = targetNormalized - currentNormalized;
    if (additionalRotation <= 0) additionalRotation += 360;
    const totalRotation = rotation + spins * 360 + additionalRotation;
    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const landedNormalized = normalize360(-totalRotation);
      const landedIndex = Math.floor(landedNormalized / segmentAngle) % items.length;
      setSelectedItem(items[landedIndex].name);
      if (isChatWheel) {
        setBonusColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      } else {
        setBonusColor(null);
      }
      setShowResult(true);
    }, 5000);
  };

  const createWheelSegments = () => {
    return items.map((item, index) => {
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
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (midAngle * Math.PI) / 180;
      const textRadius = wheelType === 'colors' ? 28 : 32;
      const textX = 50 + textRadius * Math.cos(midRad);
      const textY = 50 + textRadius * Math.sin(midRad);
      const isLightColor = item.name === 'Gray' || item.name === 'Gold';
      const textColor = isLightColor ? 'hsl(230, 25%, 15%)' : 'white';

      return (
        <g key={`${item.name}-${index}`}>
          <path
            d={pathD}
            fill={item.color}
            stroke="hsl(230, 25%, 15%)"
            strokeWidth="0.5"
            className="transition-all duration-300"
            opacity={item.placeholder ? 0.5 : 1}
          />
          <text
            x={textX}
            y={textY}
            fill={textColor}
            fontSize={wheelType === 'colors' ? '4' : '2.6'}
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              textShadow: isLightColor ? 'none' : '0 0 3px rgba(0,0,0,0.8)',
              letterSpacing: '0.02em',
            }}
          >
            {item.name.length > 14 ? item.name.substring(0, 13) + '…' : item.name}
          </text>
        </g>
      );
    });
  };

  const collecting = chatState === 'collecting';
  const hasPlaceholders = items.some((i) => i.placeholder);
  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, '0');
  const suggestionCount = suggestionsRef.current.length;

  const centerEmoji =
    wheelType === 'colors' ? '🎨' : wheelType === 'reload' ? RELOAD_POIS[reloadMap].emoji : 'FN';

  return (
    <div className="relative flex flex-col items-center gap-2 w-full max-w-3xl">
      {/* Top control row */}
      <div className="flex flex-wrap items-center justify-center gap-2 z-20 w-full">
        <Select value={wheelType} onValueChange={handleWheelChange} disabled={isSpinning || collecting}>
          <SelectTrigger className="w-[160px] bg-card border-primary/30 text-foreground text-sm">
            <SelectValue placeholder="Select wheel" />
          </SelectTrigger>
          <SelectContent className="bg-card border-primary/30">
            <SelectItem value="pois">📍 BR Drop Location</SelectItem>
            <SelectItem value="reload">🔄 Reload Drop</SelectItem>
            <SelectItem value="colors">🎨 Rarity Color</SelectItem>
          </SelectContent>
        </Select>

        {wheelType === 'reload' && (
          <Select
            value={reloadMap}
            onValueChange={(v) => handleReloadMapChange(v as ReloadMap)}
            disabled={isSpinning || collecting}
          >
            <SelectTrigger className="w-[170px] bg-card border-primary/30 text-foreground text-sm">
              <SelectValue placeholder="Reload island" />
            </SelectTrigger>
            <SelectContent className="bg-card border-primary/30">
              {(Object.keys(RELOAD_POIS) as ReloadMap[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {RELOAD_POIS[k].emoji} {RELOAD_POIS[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {isChatWheel && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground font-body">Twitch:</span>
            <Input
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="channel_name"
              className="h-8 w-[140px] text-sm bg-card border-primary/30"
              disabled={collecting}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={saveChannel}
              disabled={collecting || !channelInput.trim() || channelInput.trim() === twitchChannel}
              className="h-8"
            >
              Save
            </Button>
            {twitchChannel && (
              <span
                className={`text-xs ${
                  chatState !== 'collecting'
                    ? 'text-muted-foreground'
                    : twitchStatus === 'connected'
                    ? 'text-green-400'
                    : twitchStatus === 'connecting'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
                title={
                  chatState !== 'collecting'
                    ? 'Chat listener starts when you press LET\u2019S GO!'
                    : `Chat listener: ${twitchStatus}`
                }
              >
                ●{' '}
                {chatState !== 'collecting'
                  ? 'ready'
                  : twitchStatus === 'connected'
                  ? 'listening'
                  : twitchStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Collecting HUD */}
      {isChatWheel && collecting && (
        <div className="w-full max-w-md bg-card/80 border-2 border-destructive rounded-lg px-4 py-2 flex items-center justify-between animate-pulse-glow">
          <div className="text-left">
            <p className="text-xs text-muted-foreground font-body">SUGGESTIONS OPEN</p>
            <p className="text-sm font-display text-foreground">
              Type <span className="text-primary font-bold">{COMMAND} location</span> in chat
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-destructive text-glow leading-none">
              {mm}:{ss}
            </p>
            <p className="text-xs text-muted-foreground">
              {suggestionCount}/{totalSlots} slots
            </p>
          </div>
        </div>
      )}

      {/* Wheel */}
      <div className="relative">
        <div className="absolute inset-[-15px] rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-xl animate-pulse" />
        <div className="relative w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full p-1.5 bg-gradient-to-br from-primary/50 via-secondary/50 to-accent/50 box-glow">
          <div className="w-full h-full rounded-full bg-card p-1">
            <div
              className="w-full h-full rounded-full overflow-hidden transition-transform"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '5s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {createWheelSegments()}
                <circle cx="50" cy="50" r="8" fill="hsl(230, 25%, 12%)" stroke="hsl(190, 100%, 50%)" strokeWidth="1" />
                <text
                  x="50" y="50" fill="hsl(190, 100%, 50%)" fontSize="3" fontWeight="bold"
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {centerEmoji}
                </text>
              </svg>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div
            className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-accent drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 10px hsl(25, 100%, 55%))' }}
          />
        </div>
      </div>

      {/* Action button / result card */}
      <motion.div layout transition={{ type: 'spring', stiffness: 200, damping: 22 }} className="relative flex flex-col items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {showResult && selectedItem ? (
            <motion.div
              key="result-card"
              layout
              initial={{ rotate: 720, scale: 0.3, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, duration: 0.8 }}
              onClick={() => {
                setShowResult(false);
                if (isChatWheel) {
                  setPoiMode('idle');
                  setPoiSlots(buildDefaultSlots(activePool));
                  suggestionsRef.current = [];
                  setRotation(0);
                }
              }}
              className="cursor-pointer bg-gradient-to-br from-card to-muted px-8 py-5 rounded-2xl border-2 border-primary box-glow text-center max-w-lg"
              style={{ boxShadow: '0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--accent) / 0.4)' }}
            >
              <p className="text-muted-foreground font-body text-base mb-1">
                {isChatWheel ? "You're dropping at:" : 'Your color is:'}
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary text-glow mb-2">
                {selectedItem}
              </h2>
              <p className="text-4xl mb-1">{isChatWheel ? '🪂' : '🎨'}</p>
              {bonusColor && (
                <div className="mt-2 space-y-1 border-t border-primary/30 pt-2">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">First kill weapon color:</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: bonusColor.color }} />
                      <span className="text-lg font-display font-bold text-secondary text-glow">{bonusColor.name}</span>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2 italic">Tap to spin again</p>
            </motion.div>
          ) : collecting ? (
            <motion.div
              key="cancel-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <button
                onClick={cancelCollection}
                className="px-6 py-3 rounded-full font-display text-base font-bold uppercase tracking-wider bg-muted text-foreground hover:bg-muted/80 border border-border"
              >
                ✋ Cancel
              </button>
              <button
                onClick={closeCollection}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline bg-transparent border-0 p-0"
              >
                end suggestion window
              </button>
            </motion.div>
          ) : (
            (() => {
              const showSpin = isChatWheel ? poiMode === 'ready' : true;
              const disabled = isChatWheel
                ? (poiMode === 'idle' ? !twitchChannel : (isSpinning || hasPlaceholders))
                : isSpinning;
              const onClick = () => {
                if (isSpinning) return;
                if (!isChatWheel) return spin();
                if (poiMode === 'idle') return startCollection();
                if (poiMode === 'ready') return spin();
              };
              const label = isSpinning
                ? '🌀 SPINNING…'
                : showSpin
                ? (isChatWheel ? '🎯 SPIN THE WHEEL!' : '🎨 SPIN FOR COLOR')
                : "🚨 LET'S GO!";
              const sublabel = isChatWheel && poiMode === 'idle'
                ? `Open chat for ${TIMER_SECONDS / 60} min`
                : isChatWheel && poiMode === 'ready'
                ? 'Board locked — spin it!'
                : null;
              return (
                <motion.button
                  key="main-red-button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  onClick={onClick}
                  disabled={disabled}
                  title={isChatWheel && poiMode === 'idle' && !twitchChannel ? 'Set your Twitch channel first' : undefined}
                  className={`
                    relative px-10 py-4 rounded-full font-display text-xl font-bold uppercase tracking-wider
                    bg-gradient-to-br from-destructive to-red-700 text-destructive-foreground
                    transform hover:scale-105 active:scale-95 animate-pulse-glow
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  `}
                  style={{ boxShadow: '0 0 25px hsl(var(--destructive) / 0.7), 0 0 50px hsl(var(--destructive) / 0.4)' }}
                >
                  <span className="inline-block" style={isSpinning ? { animation: 'spin 1s linear infinite' } : undefined}>
                    {label}
                  </span>
                  {sublabel && (
                    <span className="block text-xs font-body normal-case tracking-normal opacity-90 mt-0.5">
                      {sublabel}
                    </span>
                  )}
                </motion.button>
              );
            })()
          )}
        </AnimatePresence>
      </motion.div>

      {/* Suggestion list */}
      {isChatWheel && collecting && suggestionCount > 0 && (
        <div className="mt-1 w-full max-w-md">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
            {suggestionsRef.current.map((s, i) => (
              <div
                key={`${s.user}-${i}`}
                className="px-2 py-1 rounded text-xs font-body flex items-center gap-1.5 bg-muted/50 border border-border"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-foreground/80 truncate">
                  <span className="text-primary">{s.user}:</span> {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryWheel;
