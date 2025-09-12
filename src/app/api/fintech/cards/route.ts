import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-static';
export const revalidate = 0;
import { StripeHealthcareFinTechAgent } from '@/lib/StripeHealthcareFinTechAgent';
import { getClientIP, rateLimit, requireAuthHeaders, parseJson } from '@/utils/api';
import { CardIssueSchema } from '@/schemas/fintech';

const fintechAgent = new StripeHealthcareFinTechAgent();

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:cards:post', 20, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const body = await parseJson<{ action: string; data: any }>(request);
    const { action, data } = body;

    switch (action) {
      case 'issue_card': {
        const parsed = CardIssueSchema.parse(data);
        const cardResult = await fintechAgent.issueHealthcareCard(parsed);
        return NextResponse.json(cardResult);
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown card action' },
          { status: 400 }
        );
    }
  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request payload', details: (error as any).issues },
        { status: 400 }
      );
    }
    console.error('Card API error:', error);
    return NextResponse.json(
      { success: false, error: 'Card operation failed' },
      { status: 500 }
    );
  }
}
