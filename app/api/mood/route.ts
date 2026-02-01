import { NextRequest, NextResponse } from 'next/server';
import { computeMood } from '@/lib/mood-engine';
import { fetchBaseTransactions, analyzeTransactions } from '@/lib/activity';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Fetch transactions (no cache)
    const txs = await fetchBaseTransactions(address);
    
    // Analyze activity
    const activity = analyzeTransactions(txs, address);
    
    // Compute mood
    const moodResult = computeMood(activity);

    const response = NextResponse.json(moodResult);
    
    // Prevent caching at all levels
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error in /api/mood:', error);
    return NextResponse.json(
      { error: 'Failed to compute mood' },
      { status: 500 }
    );
  }
}
