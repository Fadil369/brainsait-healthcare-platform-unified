import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-static';
export const revalidate = 0;
import { StripeHealthcareFinTechAgent } from '@/lib/StripeHealthcareFinTechAgent';
import { getClientIP, rateLimit, requireAuthHeaders, parseJson } from '@/utils/api';
import { ProcessPaymentSchema, ClaimSchema, WorkflowIntegrationSchema } from '@/schemas/fintech';
import { logger } from '@/utils/logger';
import { hasAccess, Role } from '@/utils/rbac';

const fintechAgent = new StripeHealthcareFinTechAgent();

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const rid = request.headers.get('x-request-id') || `req-${Date.now()}`;
  
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:payments:post', 30, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    
    const body = await parseJson<{ action: string; data: any }>(request);
    const { action, data } = body;
    const role = (request.headers.get('x-user-role') || 'provider') as Role;
    logger.info('payments_api_request', { action, requestId: rid, role });

    switch (action) {
      case 'process_payment':
        {
          if (!hasAccess(role, 'FINTECH', 'READ_WRITE')) {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
          }
          const parsed = ProcessPaymentSchema.parse(data);
          // Ensure id is provided for the payment
          const paymentData = {
            ...parsed,
            id: parsed.id || `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };
          const paymentResult = await fintechAgent.processHealthcarePayment(paymentData);
          return NextResponse.json(paymentResult);
        }

      case 'detect_fraud':
        const fraudResult = await fintechAgent.detectPaymentFraud(data);
        return NextResponse.json({ success: true, result: fraudResult });

      case 'process_claim':
        {
          if (!hasAccess(role, 'FINTECH', 'READ_WRITE')) {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
          }
          const parsed = ClaimSchema.parse(data);
          const claimResult = await fintechAgent.automateClaimsProcessing(parsed);
          return NextResponse.json(claimResult);
        }

      case 'workflow_integration':
        {
          if (!hasAccess(role, 'FINTECH', 'READ_WRITE')) {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
          }
          const parsed = WorkflowIntegrationSchema.parse(data);
          const workflowResult = await fintechAgent.integrateWithHealthcareWorkflow(
            parsed.workflowType,
            parsed.workflowData
          );
          return NextResponse.json(workflowResult);
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
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
    logger.error('Payment API error', { error: (error as any)?.message, requestId: rid });
    return NextResponse.json(
      { success: false, error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!rateLimit(ip, 'fintech:payments:get', 60, 60_000)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!requireAuthHeaders(request)) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const timeRange = fromDate && toDate ? {
      from: new Date(fromDate),
      to: new Date(toDate),
    } : undefined;

    const analytics = await fintechAgent.generatePaymentAnalytics(
      providerId || undefined,
      timeRange
    );

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Analytics generation failed' },
      { status: 500 }
    );
  }
}
