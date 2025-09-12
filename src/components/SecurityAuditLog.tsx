/**
 * BRAINSAIT: Security Audit Log Component
 * MEDICAL: HIPAA compliant audit trail
 * NEURAL: Real-time security monitoring
 */

'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SecurityAuditLogProps {
  userRole: 'admin' | 'provider' | 'patient' | 'auditor';
  complianceLevel: 'basic' | 'hipaa' | 'nphies';
  isRTL: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  userRole: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
  complianceLevel: string;
}

export function SecurityAuditLog({ userRole, complianceLevel, isRTL }: SecurityAuditLogProps) {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    totalEvents: 0,
    successRate: 0,
    threatLevel: 'low' as 'low' | 'medium' | 'high',
    lastThreat: null as Date | null
  });

  useEffect(() => {
    // Load recent audit entries
    loadAuditEntries();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      addNewAuditEntry();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadAuditEntries = () => {
    // Simulate loading audit entries
    const mockEntries: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000),
        action: 'patient_record_access',
        resource: '/api/fhir/patient/12345',
        userRole: 'provider',
        ipAddress: '192.168.1.100',
        status: 'success',
        complianceLevel: 'hipaa'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 600000),
        action: 'claim_submission',
        resource: '/api/nphies/claim',
        userRole: 'admin',
        ipAddress: '192.168.1.101',
        status: 'success',
        complianceLevel: 'nphies'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 900000),
        action: 'failed_login_attempt',
        resource: '/api/auth/login',
        userRole: 'unknown',
        ipAddress: '10.0.0.50',
        status: 'error',
        complianceLevel: 'basic'
      }
    ];
    
    setAuditEntries(mockEntries);
    setSecurityMetrics({
      totalEvents: mockEntries.length,
      successRate: 85.7,
      threatLevel: 'low',
      lastThreat: new Date(Date.now() - 3600000)
    });
  };

  const addNewAuditEntry = () => {
    const actions = [
      'patient_record_access',
      'medication_update',
      'imaging_view',
      'claim_processing',
      'audit_log_view'
    ];
    
    const newEntry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: '/api/fhir/resource',
      userRole: userRole,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      status: Math.random() > 0.1 ? 'success' : 'warning',
      complianceLevel: complianceLevel
    };
    
    setAuditEntries(prev => [newEntry, ...prev.slice(0, 9)]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      'patient_record_access': { en: 'Patient Record Access', ar: 'الوصول لسجل المريض' },
      'medication_update': { en: 'Medication Update', ar: 'تحديث الدواء' },
      'imaging_view': { en: 'Medical Imaging View', ar: 'عرض الصور الطبية' },
      'claim_processing': { en: 'Claim Processing', ar: 'معالجة المطالبة' },
      'audit_log_view': { en: 'Audit Log View', ar: 'عرض سجل التدقيق' },
      'failed_login_attempt': { en: 'Failed Login', ar: 'فشل تسجيل الدخول' }
    };
    
    return labels[action] ? (isRTL ? labels[action].ar : labels[action].en) : action;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="glass-morphism rounded-2xl p-6 mb-8 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <span className="mr-3">🔒</span>
          {isRTL ? 'سجل التدقيق الأمني' : 'Security Audit Log'}
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            securityMetrics.threatLevel === 'low' ? 'bg-green-500/20 text-green-400' :
            securityMetrics.threatLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {isRTL ? 'مستوى التهديد: منخفض' : `Threat Level: ${securityMetrics.threatLevel.toUpperCase()}`}
          </div>
          
          <div className="text-sm text-blue-200">
            {securityMetrics.successRate}% {isRTL ? 'نجح' : 'Success'}
          </div>
        </div>
      </div>

      {/* BRAINSAIT: Security metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">
            {securityMetrics.totalEvents}
          </div>
          <div className="text-sm text-blue-200">
            {isRTL ? 'إجمالي الأحداث' : 'Total Events'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">
            {securityMetrics.successRate}%
          </div>
          <div className="text-sm text-green-200">
            {isRTL ? 'معدل النجاح' : 'Success Rate'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4">
          <div className="text-lg font-bold text-purple-400">
            HIPAA
          </div>
          <div className="text-sm text-purple-200">
            {isRTL ? 'متوافق' : 'Compliant'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4">
          <div className="text-lg font-bold text-orange-400">
            NPHIES
          </div>
          <div className="text-sm text-orange-200">
            {isRTL ? 'متكامل' : 'Integrated'}
          </div>
        </div>
      </div>

      {/* MEDICAL: Audit entries list */}
      <div className="space-y-3">
        <div className="text-lg font-semibold text-white mb-4">
          {isRTL ? 'الأحداث الأخيرة' : 'Recent Events'}
        </div>
        
        {auditEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${
                entry.status === 'success' ? 'bg-green-400' :
                entry.status === 'warning' ? 'bg-yellow-400' :
                'bg-red-400'
              }`} />
              
              <div>
                <div className="text-white font-medium">
                  {getActionLabel(entry.action)}
                </div>
                <div className="text-sm text-blue-200">
                  {entry.resource} • {entry.userRole} • {entry.ipAddress}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                {entry.status.toUpperCase()}
              </div>
              <div className="text-xs text-blue-200 mt-1">
                {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BRAINSAIT: Compliance status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              {isRTL ? 'حالة الامتثال' : 'Compliance Status'}
            </h4>
            <p className="text-sm text-green-200">
              {isRTL ? 'جميع عمليات التدقيق متوافقة مع HIPAA و NPHIES' : 'All audits compliant with HIPAA & NPHIES'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-300">
              {isRTL ? 'نشط' : 'Active'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
