import { NextRequest, NextResponse } from 'next/server';
import { StripeHealthcareFinTechAgent } from '@/lib/StripeHealthcareFinTechAgent';
import { getClientIP, rateLimit, requireAuthHeaders, parseJson } from '@/utils/api';
import { TreasuryCreateAccountSchema, TreasuryOperationSchema } from '@/schemas/fintech';

const fintechAgent = new StripeHealthcareFinTechAgent();

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:post', 30, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const body = await parseJson<{ action: string; data: any }>(request);
    const { action, data } = body;

    switch (action) {
      case 'create_account': {
        const parsed = TreasuryCreateAccountSchema.parse(data);
        const accountResult = await fintechAgent.createHealthcareTreasuryAccount(
          parsed.providerId,
          parsed.organizationData
        );
        return NextResponse.json(accountResult);
      }

      case 'treasury_operation': {
        const parsed = TreasuryOperationSchema.parse(data);
        const operationResult = await fintechAgent.manageTreasuryOperations(
          parsed.operation,
          parsed.params
        );
        return NextResponse.json(operationResult);
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown treasury action' },
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
    console.error('Treasury API error:', error);
    return NextResponse.json(
      { success: false, error: 'Treasury operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:get', 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID required' },
        { status: 400 }
      );
    }

    const balanceResult = await fintechAgent.manageTreasuryOperations(
      'balance_check',
      { accountId }
    );

    return NextResponse.json(balanceResult);
  } catch (error) {
    console.error('Balance check API error:', error);
    return NextResponse.json(
      { success: false, error: 'Balance check failed' },
      { status: 500 }
    );
  }
}
