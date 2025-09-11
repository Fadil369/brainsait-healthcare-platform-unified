/**
 * Enhanced Security & Compliance API Route
 * Demonstrates integration of PerfectSecurity and PerfectCompliance engines
 */

import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { PerfectSecurityEngine } from '../../../../lib/PerfectSecurity';
import { EnhancedSaudiComplianceEngine } from '../../../../lib/PerfectCompliance';
import { parseJson } from '@/utils/api';
import { SecurityOperationSchema } from '@/schemas/security';

const securityEngine = PerfectSecurityEngine.getInstance();
const complianceEngine = new EnhancedSaudiComplianceEngine();

// Basic per-instance rate limiting
type Counter = { count: number; reset: number };
const rlMap = new Map<string, Counter>();
const RL_WINDOW = 60_000;
const RL_MAX = 60;

function clientIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}

function allow(ip: string, key: string, max = RL_MAX, windowMs = RL_WINDOW) {
  const k = `${ip}:${key}`;
  const now = Date.now();
  const c = rlMap.get(k);
  if (!c || c.reset < now) {
    rlMap.set(k, { count: 1, reset: now + windowMs });
    return true;
  }
  c.count += 1;
  if (c.count > max) return false;
  return true;
}

/**
 * POST /api/security/compliance
 * Perform comprehensive security and compliance validation
 */
export async function POST(request: NextRequest) {
  try {
    const ip = clientIP(request);
    if (!allow(ip, 'compliance:post', 30, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: securityEngine.getSecurityHeaders() });
    }
    // Extract user context from headers
    const userId = request.headers.get('x-user-id');
    const sessionId = request.headers.get('x-session-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Authentication required - missing user context' },
        { 
          status: 401,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    // Validate user access to compliance API
    const hasAccess = await securityEngine.validateUserAccess(
      userId,
      'COMPLIANCE_API',
      'READ_WRITE',
      sessionId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions for compliance API access' },
        { 
          status: 403,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    // Parse & validate request data
    const requestData = await parseJson(request, SecurityOperationSchema);
    
    // Validate request structure
    if (!requestData || typeof requestData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data structure' },
        { 
          status: 400,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    // Extract operation type
    const operation = requestData.operation;
    
    switch (operation) {
      case 'comprehensive_assessment':
        return await handleComprehensiveAssessment(requestData, userId, sessionId);
      
      case 'encrypt_phi':
        return await handlePHIEncryption(requestData, userId, sessionId);
      
      case 'decrypt_phi':
        return await handlePHIDecryption(requestData, userId, sessionId);
      
      case 'validate_nphies':
        return await handleNPHIESValidation(requestData, userId, sessionId);
      
      case 'validate_hipaa':
        return await handleHIPAAValidation(requestData, userId, sessionId);
      
      case 'calculate_vat':
        return await handleVATCalculation(requestData, userId, sessionId);
      
      case 'security_report':
        return await handleSecurityReport(requestData, userId, sessionId);
      
      case 'compliance_monitoring':
        return await handleComplianceMonitoring(requestData, userId, sessionId);
      
      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { 
            status: 400,
            headers: securityEngine.getSecurityHeaders()
          }
        );
    }

  } catch (error) {
    if ((error as any)?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request payload', details: (error as any).issues },
        { status: 400, headers: securityEngine.getSecurityHeaders() }
      );
    }
    console.error('Compliance API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

/**
 * GET /api/security/compliance
 * Get compliance status and security metrics
 */
export async function GET(request: NextRequest) {
  try {
    const ip = clientIP(request);
    if (!allow(ip, 'compliance:get', 60, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: securityEngine.getSecurityHeaders() });
    }
    const userId = request.headers.get('x-user-id');
    const sessionId = request.headers.get('x-session-id');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { 
          status: 401,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    // Validate access
    const hasAccess = await securityEngine.validateUserAccess(
      userId,
      'COMPLIANCE_STATUS',
      'READ',
      sessionId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { 
          status: 403,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    // Get overall compliance status
    const complianceValidation = await securityEngine.validateCompliance({
      userId,
      sessionId,
      context: 'status_check'
    });

    // Get recent audit logs (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const auditLogs = securityEngine.getAuditLogs({
      startDate: yesterday,
      endDate: new Date()
    });

    // Get active security threats
    const securityThreats = securityEngine.getSecurityThreats();

    // Get active sessions
    const activeSessions = securityEngine.getActiveSessions();

    const response = {
      timestamp: new Date().toISOString(),
      complianceStatus: {
        overallScore: complianceValidation.score,
        certifications: complianceValidation.certificationStatus,
        issues: complianceValidation.issues.length,
        criticalIssues: complianceValidation.issues.filter(i => i.severity === 'CRITICAL').length
      },
      securityMetrics: {
        totalAuditEvents: auditLogs.length,
        highRiskEvents: auditLogs.filter(log => log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL').length,
        activeThreats: securityThreats.length,
        activeSessions: activeSessions.length,
        phiAccessEvents: auditLogs.filter(log => log.complianceFlags.phiAccessed).length
      },
      recommendations: complianceValidation.recommendations.slice(0, 5), // Top 5 recommendations
      recentActivity: auditLogs.slice(-10).map(log => ({
        timestamp: log.timestamp,
        action: log.action,
        status: log.status,
        riskLevel: log.riskLevel
      }))
    };

    return NextResponse.json(response, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    console.error('Compliance Status Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get compliance status' },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

// Handler functions for different operations

async function handleComprehensiveAssessment(data: any, userId: string, sessionId: string) {
  try {
    const assessment = await complianceEngine.performComprehensiveAssessment(
      data.healthcareData,
      userId,
      sessionId
    );

    return NextResponse.json({
      success: true,
      assessment,
      timestamp: new Date().toISOString()
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Comprehensive assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handlePHIEncryption(data: any, userId: string, sessionId: string) {
  try {
    if (!data.phiData) {
      return NextResponse.json(
        { error: 'PHI data is required for encryption' },
        { 
          status: 400,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    const encryptionResult = await securityEngine.encryptPHI(
      data.phiData,
      userId,
      { sessionId, ipAddress: data.ipAddress }
    );

    return NextResponse.json({
      success: true,
      encryptedData: {
        encrypted: encryptionResult.encrypted,
        keyId: encryptionResult.keyId,
        algorithm: encryptionResult.algorithm,
        timestamp: encryptionResult.timestamp,
        integrity: encryptionResult.integrity
      }
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'PHI encryption failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handlePHIDecryption(data: any, userId: string, sessionId: string) {
  try {
    if (!data.encryptedData) {
      return NextResponse.json(
        { error: 'Encrypted data is required for decryption' },
        { 
          status: 400,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    const decryptedData = await securityEngine.decryptPHI(
      data.encryptedData,
      userId,
      { sessionId, ipAddress: data.ipAddress }
    );

    return NextResponse.json({
      success: true,
      decryptedData,
      warning: 'Decrypted PHI data should be handled according to HIPAA guidelines'
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'PHI decryption failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handleNPHIESValidation(data: any, userId: string, sessionId: string) {
  try {
    const validationResult = await complianceEngine.validateNPHIES(
      data.nphiesData,
      userId,
      sessionId
    );

    return NextResponse.json({
      success: true,
      validation: validationResult
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'NPHIES validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handleHIPAAValidation(data: any, userId: string, sessionId: string) {
  try {
    const complianceValidation = await securityEngine.validateCompliance({
      userId,
      sessionId,
      dataType: 'hipaa_validation',
      context: data.hipaaData
    });

    const hipaaSpecificIssues = complianceValidation.issues.filter(
      issue => issue.regulation === 'HIPAA'
    );

    return NextResponse.json({
      success: true,
      hipaaValidation: {
        compliant: complianceValidation.certificationStatus.hipaa,
        score: complianceValidation.score,
        issues: hipaaSpecificIssues,
        recommendations: complianceValidation.recommendations
      }
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'HIPAA validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handleVATCalculation(data: any, userId: string, sessionId: string) {
  try {
    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { error: 'Items array is required for VAT calculation' },
        { 
          status: 400,
          headers: securityEngine.getSecurityHeaders()
        }
      );
    }

    const vatResult = await complianceEngine.calculateVAT(
      data.items,
      userId,
      sessionId
    );

    return NextResponse.json({
      success: true,
      vatCalculation: vatResult
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'VAT calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handleSecurityReport(data: any, userId: string, sessionId: string) {
  try {
    const timeRange = {
      from: data.fromDate ? new Date(data.fromDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: data.toDate ? new Date(data.toDate) : new Date()
    };

    const complianceReport = await complianceEngine.generateEnhancedComplianceReport(
      timeRange,
      userId,
      sessionId
    );

    return NextResponse.json({
      success: true,
      report: complianceReport
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Security report generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}

async function handleComplianceMonitoring(data: any, userId: string, sessionId: string) {
  try {
    const monitoringConfig = {
      interval: data.interval || 60000, // Default 1 minute
      thresholds: data.thresholds || {
        critical: 90,
        high: 80,
        medium: 70
      },
      alertMethods: data.alertMethods || ['email', 'dashboard']
    };

    const monitoringId = await complianceEngine.startComplianceMonitoring(
      userId,
      sessionId,
      monitoringConfig
    );

    return NextResponse.json({
      success: true,
      monitoringId,
      message: 'Compliance monitoring started successfully'
    }, {
      headers: securityEngine.getSecurityHeaders()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Compliance monitoring setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: securityEngine.getSecurityHeaders()
      }
    );
  }
}
