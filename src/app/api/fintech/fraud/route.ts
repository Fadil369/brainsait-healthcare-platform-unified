import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-static';
export const revalidate = 0;
import { StripeHealthcareFinTechAgent } from '@/lib/StripeHealthcareFinTechAgent';
import { getClientIP, rateLimit, requireAuthHeaders, parseJson } from '@/utils/api';
import { FraudAnalyzeSchema, TimeRangeSchema, ProviderRiskSchema } from '@/schemas/fintech';

const fintechAgent = new StripeHealthcareFinTechAgent();

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:fraud:post', 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const body = await parseJson<{ action: string; data: any }>(request);
    const { action, data } = body;

    switch (action) {
      case 'analyze_payment':
        {
          const parsed = FraudAnalyzeSchema.parse(data);
          const fraudResult = await fintechAgent.detectPaymentFraud(parsed as any);
        return NextResponse.json({ success: true, result: fraudResult });
        }

      case 'generate_report':
        {
          const tr = TimeRangeSchema.parse(data.timeRange);
          const report = await fintechAgent.generateFraudReport({
            from: new Date(tr.from),
            to: new Date(tr.to),
          });
        return NextResponse.json({ success: true, report });
        }

      case 'get_provider_risk':
        {
          const parsed = ProviderRiskSchema.parse({ providerId: data.providerId });
          const riskAssessment = fintechAgent.getProviderRiskAssessment(parsed.providerId);
        return NextResponse.json({ success: true, assessment: riskAssessment });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown fraud detection action' },
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
    console.error('Fraud detection API error:', error);
    return NextResponse.json(
      { success: false, error: 'Fraud detection failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:fraud:get', 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (providerId) {
      // Get provider risk assessment
      const assessment = fintechAgent.getProviderRiskAssessment(providerId);
      return NextResponse.json({ success: true, assessment });
    }

    if (fromDate && toDate) {
      // Generate fraud report
      const timeRange = {
        from: new Date(fromDate),
        to: new Date(toDate),
      };
      const report = await fintechAgent.generateFraudReport(timeRange);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Fraud report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Fraud report generation failed' },
      { status: 500 }
    );
  }
}
