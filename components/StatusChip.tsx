'use client';

export function StatusChip({ 
  isConnected, 
  address 
}: { 
  isConnected: boolean; 
  address?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs bg-black/30 border border-[var(--border)] px-4 py-2 rounded-full">
      <div 
        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
          isConnected 
            ? 'bg-[var(--neon-blue)] shadow-[0_0_8px_var(--neon-blue)]' 
            : 'bg-[var(--text-muted)] shadow-none'
        }`}
      />
      <span>
        {isConnected && address 
          ? `${address.slice(0, 6)}...${address.slice(-4)}` 
          : 'Not Connected'}
      </span>
    </div>
  );
}
