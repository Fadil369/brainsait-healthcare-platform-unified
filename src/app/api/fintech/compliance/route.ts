import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-static';
export const revalidate = 0;
import { StripeHealthcareFinTechAgent } from '@/lib/StripeHealthcareFinTechAgent';

const fintechAgent = new StripeHealthcareFinTechAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'check_compliance':
        const complianceResult = await fintechAgent.classifyHealthcareData(data);
        return NextResponse.json({ success: true, result: complianceResult });

      case 'generate_report':
        const report = await fintechAgent.generateComplianceReport(data.timeRange);
        return NextResponse.json({ success: true, report });

      case 'classify_data':
        const classification = await fintechAgent.classifyHealthcareData(data);
        return NextResponse.json({ success: true, classification });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown compliance action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { success: false, error: 'Compliance check failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (fromDate && toDate) {
      const timeRange = {
        from: new Date(fromDate),
        to: new Date(toDate),
      };
      const report = await fintechAgent.generateComplianceReport(timeRange);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json(
      { success: false, error: 'Missing time range parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Compliance report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Compliance report generation failed' },
      { status: 500 }
    );
  }
}