'use client';

interface NFTPreviewProps {
  moodId: number;
  weekIndex: number;
  stats: {
    tx7d: number;
    swaps7d: number;
    approvals7d: number;
  };
  rarityId: number;
  tokenId?: number;
}

const MOOD_CONFIG: Record<number, {
  name: string;
  tagline: string;
  bg: string;
  bgGrad: string;
  accent: string;
  icon: string;
  pattern: string;
}> = {
  0: {
    name: 'Builder Mode',
    tagline: 'Shipping onchain',
    bg: '#0b1020',
    bgGrad: 'url(#builderGrad)',
    accent: '#2b6cff',
    icon: '🔧',
    pattern: 'blueprint',
  },
  1: {
    name: 'Degen Mode',
    tagline: 'Fast rotations',
    bg: '#140713',
    bgGrad: 'url(#degenGrad)',
    accent: '#ff2e88',
    icon: '🔥',
    pattern: 'candles',
  },
  2: {
    name: 'Collector Mode',
    tagline: 'Curating the bag',
    bg: '#0d0a1a',
    bgGrad: 'url(#collectorGrad)',
    accent: '#8a5cff',
    icon: '💎',
    pattern: 'gallery',
  },
  3: {
    name: 'Bridge Tourist',
    tagline: 'Cross chain wandering',
    bg: '#061415',
    bgGrad: 'url(#bridgeGrad)',
    accent: '#00c2b8',
    icon: '🌉',
    pattern: 'routes',
  },
  4: {
    name: 'Quiet Mode',
    tagline: 'Low noise energy',
    bg: '#0b0d10',
    bgGrad: 'url(#quietGrad)',
    accent: '#c7cbd1',
    icon: '🌙',
    pattern: 'fog',
  },
};

const RARITY_CONFIG: Record<number, { name: string; glowIntensity: number; hasShine: boolean; hasSparkles: boolean }> = {
  0: { name: 'Common', glowIntensity: 0.3, hasShine: false, hasSparkles: false },
  1: { name: 'Rare', glowIntensity: 0.6, hasShine: false, hasSparkles: false },
  2: { name: 'Legendary', glowIntensity: 1, hasShine: true, hasSparkles: true },
};

export function NFTPreview({ moodId, weekIndex, stats, rarityId, tokenId = 0 }: NFTPreviewProps) {
  const mood = MOOD_CONFIG[moodId] || MOOD_CONFIG[4];
  const rarity = RARITY_CONFIG[rarityId] || RARITY_CONFIG[0];

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      <svg
        viewBox="0 0 1024 1024"
        className="w-full h-auto rounded-[40px] shadow-2xl"
        style={{
          filter: `drop-shadow(0 0 ${20 * rarity.glowIntensity}px ${mood.accent}40)`,
        }}
      >
        <defs>
          {/* Mood-specific gradients */}
          <linearGradient id="builderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b1020" />
            <stop offset="100%" stopColor="#0a1428" />
          </linearGradient>
          <linearGradient id="degenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#140713" />
            <stop offset="100%" stopColor="#1a0a18" />
          </linearGradient>
          <linearGradient id="collectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0a1a" />
            <stop offset="100%" stopColor="#120e22" />
          </linearGradient>
          <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#061415" />
            <stop offset="100%" stopColor="#081a1c" />
          </linearGradient>
          <linearGradient id="quietGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0b0d10" />
            <stop offset="100%" stopColor="#0e1014" />
          </linearGradient>

          {/* Noise pattern */}
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
          </filter>

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mood.accent} strokeWidth="0.5" opacity="0.1" />
          </pattern>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill={mood.bgGrad} />

        {/* Grid overlay */}
        <rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill="url(#grid)" />

        {/* Noise texture overlay */}
        <rect x="0" y="0" width="1024" height="1024" rx="80" ry="80" fill={mood.bg} opacity="0.3" filter="url(#noise)" />

        {/* Outer border with glow */}
        <rect
          x="64"
          y="64"
          width="896"
          height="896"
          rx="60"
          ry="60"
          fill="none"
          stroke={mood.accent}
          strokeWidth="6"
          opacity={0.5 + rarity.glowIntensity * 0.5}
          filter={rarity.glowIntensity > 0.5 ? 'url(#glow)' : undefined}
        />

        {/* Inner border */}
        <rect
          x="72"
          y="72"
          width="880"
          height="880"
          rx="56"
          ry="56"
          fill="none"
          stroke={mood.accent}
          strokeWidth="1"
          opacity="0.2"
        />

        {/* Header line */}
        <rect x="64" y="140" width="896" height="2" fill={mood.accent} opacity="0.35" />

        {/* Header text */}
        <text x="96" y="118" fill="#ffffff" opacity="0.95" fontWeight="700" fontSize="34" fontFamily="system-ui, sans-serif">
          Wallet Mood Ring
        </text>

        {/* Week label */}
        <text x="96" y="190" fill="#ffffff" opacity="0.8" fontWeight="600" fontSize="28" fontFamily="system-ui, sans-serif">
          Week {weekIndex.toString().padStart(2, '0')}
        </text>

        {/* Mood icon */}
        <text x="880" y="200" fontSize="48" textAnchor="end">
          {mood.icon}
        </text>

        {/* Main mood title */}
        <text x="96" y="320" fill={mood.accent} fontWeight="800" fontSize="64" fontFamily="system-ui, sans-serif" filter="url(#glow)">
          MOOD: {mood.name}
        </text>

        {/* Tagline */}
        <text x="96" y="370" fill="#ffffff" opacity="0.6" fontWeight="500" fontSize="24" fontFamily="system-ui, sans-serif" fontStyle="italic">
          {mood.tagline}
        </text>

        {/* Stat chips */}
        {[
          { label: `${stats.tx7d} tx`, y: 420 },
          { label: `${stats.swaps7d} swaps`, y: 490 },
          { label: `${stats.approvals7d} approvals`, y: 560 },
        ].map((chip, i) => (
          <g key={i}>
            <rect x="96" y={chip.y} width="420" height="56" rx="18" ry="18" fill="#ffffff" opacity="0.08" />
            <rect x="108" y={chip.y + 12} width="32" height="32" rx="10" ry="10" fill={mood.accent} opacity="0.9" />
            <text x="156" y={chip.y + 38} fill="#ffffff" opacity="0.92" fontWeight="650" fontSize="28" fontFamily="system-ui, sans-serif">
              {chip.label}
            </text>
          </g>
        ))}

        {/* Rarity bar */}
        <rect x="96" y="660" width="832" height="80" rx="20" ry="20" fill="#000000" opacity="0.3" />
        <g>
          {['Common', 'Rare', 'Legendary'].map((name, i) => {
            const isActive = i === rarityId;
            const xPos = 120 + i * 270;
            return (
              <g key={name}>
                <rect
                  x={xPos - 10}
                  y="672"
                  width="240"
                  height="56"
                  rx="12"
                  ry="12"
                  fill={isActive ? mood.accent : 'transparent'}
                  opacity={isActive ? 0.2 : 0}
                />
                <text
                  x={xPos + 110}
                  y="708"
                  fill={isActive ? '#ffffff' : '#666666'}
                  fontWeight={isActive ? '700' : '500'}
                  fontSize="26"
                  fontFamily="system-ui, sans-serif"
                  textAnchor="middle"
                  opacity={isActive ? 1 : 0.5}
                >
                  {name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Token ID */}
        <text x="96" y="820" fill="#ffffff" opacity="0.55" fontWeight="600" fontSize="24" fontFamily="system-ui, sans-serif">
          Token #{tokenId}
        </text>

        {/* Footer */}
        <text x="96" y="900" fill="#ffffff" opacity="0.55" fontWeight="600" fontSize="24" fontFamily="system-ui, sans-serif">
          Built on Base
        </text>

        {/* Corner accent dot */}
        <circle cx="920" cy="920" r="28" fill={mood.accent} opacity={0.2 + rarity.glowIntensity * 0.3} />
        <circle cx="920" cy="920" r="14" fill={mood.accent} opacity="0.95" />

        {/* Legendary shine effect */}
        {rarity.hasShine && (
          <rect
            x="0"
            y="0"
            width="1024"
            height="1024"
            rx="80"
            ry="80"
            fill="url(#shineGrad)"
            opacity="0.15"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}

        {/* Legendary sparkles */}
        {rarity.hasSparkles && (
          <>
            <circle cx="200" cy="280" r="3" fill="#ffffff" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="850" cy="350" r="2" fill="#ffffff" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="750" cy="150" r="2.5" fill="#ffffff" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}

        {/* Shine gradient for legendary */}
        <defs>
          <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="transparent" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
