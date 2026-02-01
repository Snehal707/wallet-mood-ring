export interface WalletActivity {
  txCount: number;
  activeDays: number;
  swaps: number;
  approvals: number;
  nftMints: number;
  marketplaceInteractions: number;
  bridgeCount: number;
  uniqueContracts: number;
  lendingInteractions: number;
  lpInteractions: number;
}

export interface MoodScores {
  activity: number; // 0-100
  defi: number; // 0-100
  collector: number; // 0-100
  risk: number; // 0-100
}

export interface MoodResult {
  moodId: number; // 0: Builder, 1: Degen, 2: Collector, 3: Bridge Tourist, 4: Quiet
  moodName: string;
  scores: MoodScores;
  stats: {
    tx7d: number;
    swaps7d: number;
    approvals7d: number;
    bridges7d: number;
    uniqueContracts: number;
    nftMints: number;
  };
  reasons: string[];
  weekIndex: number;
  rarityId: number; // 0: Common, 1: Rare, 2: Legendary
}

const MOOD_NAMES = [
  'Builder Mode',
  'Degen Mode',
  'Collector Mode',
  'Bridge Tourist',
  'Quiet Mode',
];

export function computeMood(activity: WalletActivity): MoodResult {
  // Calculate scores (0-100)
  const activityScore = Math.min(100, (activity.txCount * 2) + (activity.activeDays * 10));
  const defiScore = Math.min(100, (activity.swaps * 8) + (activity.lendingInteractions * 10) + (activity.lpInteractions * 12));
  const collectorScore = Math.min(100, (activity.nftMints * 15) + (activity.marketplaceInteractions * 10));
  const riskScore = Math.min(100, (activity.approvals * 12) + (activity.uniqueContracts * 3));

  const scores: MoodScores = {
    activity: activityScore,
    defi: defiScore,
    collector: collectorScore,
    risk: riskScore,
  };

  // Determine mood
  let moodId = 4; // Default: Quiet Mode
  
  // FIRST: Check if wallet has any activity at all
  const hasActivity = activity.txCount > 0 || activity.uniqueContracts > 0;
  
  if (!hasActivity) {
    // No activity = Quiet Mode, no exceptions
    moodId = 4;
  }
  // Bridge Tourist: high bridge count relative to total tx
  else if (activity.bridgeCount > 0 && activity.bridgeCount / Math.max(1, activity.txCount) > 0.3) {
    moodId = 3;
  }
  // Degen Mode: highest risk score AND has actual risky activity
  else if (riskScore > 0 && riskScore >= Math.max(activityScore, defiScore, collectorScore)) {
    moodId = 1;
  }
  // Collector Mode: highest collector score AND has actual collector activity
  else if (collectorScore > 0 && collectorScore >= Math.max(activityScore, defiScore, riskScore)) {
    moodId = 2;
  }
  // Builder Mode: high unique contracts but moderate risk
  else if (activity.uniqueContracts >= 5 && riskScore < 70) {
    moodId = 0;
  }
  // Low activity = Quiet Mode
  else if (activity.txCount < 5 && activity.uniqueContracts < 3) {
    moodId = 4;
  }
  // Default to Builder Mode if has some activity
  else if (activity.txCount >= 5) {
    moodId = 0;
  }

  // Generate reasons (top 3 stats) - only show actual stats
  const reasons: string[] = [];
  
  if (activity.txCount > 0) {
    reasons.push(`${activity.txCount} tx in 7 days`);
  }
  if (activity.swaps > 0) {
    reasons.push(`${activity.swaps} swaps`);
  }
  if (activity.approvals > 0) {
    reasons.push(`${activity.approvals} approvals`);
  }
  if (activity.nftMints > 0 && reasons.length < 3) {
    reasons.push(`${activity.nftMints} NFT mints`);
  }
  if (activity.bridgeCount > 0 && reasons.length < 3) {
    reasons.push(`${activity.bridgeCount} bridges`);
  }
  if (activity.uniqueContracts > 0 && reasons.length < 3) {
    reasons.push(`${activity.uniqueContracts} unique contracts`);
  }
  if (activity.activeDays > 0 && reasons.length < 3) {
    reasons.push(`${activity.activeDays} active days`);
  }

  // If no activity, show appropriate message
  if (reasons.length === 0) {
    reasons.push('No transactions in 7 days');
    reasons.push('Wallet is dormant');
    reasons.push('Time to explore Base!');
  }
  
  // Pad with relevant messages if needed (but not fake stats)
  while (reasons.length < 3) {
    if (moodId === 4) {
      reasons.push('Ready for your first Base tx');
    } else {
      reasons.push('Active on Base');
    }
  }

  // Calculate rarity - only give higher rarity for actual activity
  let rarityId = 0; // Common
  const totalScore = activityScore + defiScore + collectorScore;
  if (totalScore > 200 && activity.txCount > 20) {
    rarityId = 2; // Legendary - requires high activity
  } else if (totalScore > 100 && activity.txCount > 10) {
    rarityId = 1; // Rare - requires moderate activity
  }

  // Calculate week index (week of year, 1-52)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekIndex = Math.ceil(diff / oneWeek);

  return {
    moodId,
    moodName: MOOD_NAMES[moodId],
    scores,
    stats: {
      tx7d: activity.txCount,
      swaps7d: activity.swaps,
      approvals7d: activity.approvals,
      bridges7d: activity.bridgeCount,
      uniqueContracts: activity.uniqueContracts,
      nftMints: activity.nftMints,
    },
    reasons: reasons.slice(0, 3),
    weekIndex,
    rarityId,
  };
}
