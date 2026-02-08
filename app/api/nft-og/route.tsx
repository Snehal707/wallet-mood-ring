import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const MOOD_CONFIG: Record<number, { name: string; tagline: string; accent: string; icon: string }> = {
  0: { name: 'Builder Mode', tagline: 'Shipping onchain', accent: '#2b6cff', icon: '🔧' },
  1: { name: 'Degen Mode', tagline: 'Fast rotations', accent: '#ff2e88', icon: '🔥' },
  2: { name: 'Collector Mode', tagline: 'Curating the bag', accent: '#8a5cff', icon: '💎' },
  3: { name: 'Bridge Tourist', tagline: 'Cross chain wandering', accent: '#00c2b8', icon: '🌉' },
  4: { name: 'Quiet Mode', tagline: 'Low noise energy', accent: '#c7cbd1', icon: '🌙' },
};

const RARITY_NAMES = ['Common', 'Rare', 'Legendary'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const moodId = parseInt(searchParams.get('moodId') ?? '4', 10);
  const weekIndex = parseInt(searchParams.get('weekIndex') ?? '1', 10);
  const rarityId = parseInt(searchParams.get('rarityId') ?? '0', 10);
  const tx7d = parseInt(searchParams.get('tx7d') ?? '0', 10);
  const swaps7d = parseInt(searchParams.get('swaps7d') ?? '0', 10);
  const approvals7d = parseInt(searchParams.get('approvals7d') ?? '0', 10);

  const mood = MOOD_CONFIG[moodId] ?? MOOD_CONFIG[4];
  const rarityName = RARITY_NAMES[rarityId] ?? 'Common';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${mood.accent}22 0%, #0b0d10 50%, ${mood.accent}11 100%)`,
          borderRadius: 48,
          border: `4px solid ${mood.accent}88`,
          padding: 48,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>Wallet Mood Ring</span>
          <span style={{ fontSize: 24, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            Week {weekIndex.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Mood title */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 24, marginBottom: 16 }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: mood.accent }}>MOOD: {mood.name}</span>
          <span style={{ fontSize: 48 }}>{mood.icon}</span>
        </div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 32 }}>
          {mood.tagline}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: mood.accent }} />
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>{tx7d} tx</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: mood.accent }} />
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>{swaps7d} swaps</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, background: mood.accent }} />
            <span style={{ fontSize: 24, color: 'white', fontWeight: 600 }}>{approvals7d} approvals</span>
          </div>
        </div>

        {/* Rarity */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          {RARITY_NAMES.map((name, i) => (
            <div
              key={name}
              style={{
                padding: '12px 32px',
                borderRadius: 12,
                background: i === rarityId ? `${mood.accent}40` : 'transparent',
                color: i === rarityId ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: i === rarityId ? 700 : 500,
                fontSize: 22,
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Built on Base</div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );
}
