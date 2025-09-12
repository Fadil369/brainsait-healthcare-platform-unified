/**
 * BRAINSAIT: Advanced Healthcare Platform Homepage
 * MEDICAL: FHIR R4 compliant with HIPAA security
 * NEURAL: Glass morphism with mesh gradients
 * BILINGUAL: Arabic/English RTL support
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import MeshBackground from '@/components/MeshBackground';
import { HealthcareMetrics } from '@/components/HealthcareMetrics';
import { ComplianceStatus } from '@/components/ComplianceStatus';
import { AIServicesGrid } from '@/components/AIServicesGrid';
import { NphiesIntegration } from '@/components/NphiesIntegration';
import { SecurityAuditLog } from '@/components/SecurityAuditLog';

interface UserRole {
  role: 'admin' | 'provider' | 'patient' | 'auditor';
  permissions: string[];
  complianceLevel: 'basic' | 'hipaa' | 'nphies';
}

export default function AdvancedHealthcarePlatform() {
  const [userRole, setUserRole] = useState<UserRole>({
    role: 'provider',
    permissions: ['read:patients', 'write:records'],
    complianceLevel: 'hipaa'
  });
  
  const [isRTL, setIsRTL] = useState(false);
  const [platformMetrics, setPlatformMetrics] = useState({
    activeUsers: 0,
    processingClaims: 0,
    aiAccuracy: 0,
    complianceScore: 0
  });

  // BRAINSAIT: Audit logging for page access
  useEffect(() => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action: 'page_access',
      resource: 'healthcare_dashboard',
      userRole: userRole.role,
      complianceLevel: userRole.complianceLevel,
      sessionId: crypto.randomUUID()
    };
    
    // Log to audit system
    fetch('/api/security/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditLog)
    });

    // Load real-time metrics
    loadPlatformMetrics();
  }, [userRole]);

  const loadPlatformMetrics = async () => {
    try {
      const response = await fetch('/api/dashboard/metrics');
      const metrics = await response.json();
      setPlatformMetrics(metrics);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* NEURAL: Mesh gradient background with glass morphism */}
      <MeshBackground 
        className="fixed inset-0 -z-10"
        primarySpeed={0.3}
        wireframeSpeed={0.2}
        colors={{
          primary: ['#1a365d', '#2b6cb8', '#0ea5e9'],
          accent: ['#ea580c', '#64748b'],
          wireframe: '#ffffff60'
        }}
      />

      {/* BRAINSAIT: Main healthcare dashboard container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        {/* MEDICAL: Healthcare platform header */}
        <header className="glass-morphism rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🏥</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  BrainSAIT Healthcare Platform
                </h1>
                <p className="text-blue-200">
                  AI-Powered Healthcare • NPHIES Integrated • HIPAA Compliant
                </p>
              </div>
            </motion.div>

            {/* BILINGUAL: Language toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsRTL(!isRTL)}
                className="glass-button px-4 py-2 rounded-lg text-white hover:bg-white/10"
              >
                {isRTL ? 'EN' : 'العربية'}
              </button>
              <ComplianceStatus 
                level={userRole.complianceLevel}
                userRole={userRole.role}
              />
            </div>
          </div>
        </header>

        {/* MEDICAL: Real-time healthcare metrics */}
        <HealthcareMetrics 
          metrics={platformMetrics}
          userRole={userRole.role}
          isRTL={isRTL}
        />

        {/* BRAINSAIT: AI Services grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <AIServicesGrid 
            userRole={userRole.role}
            complianceLevel={userRole.complianceLevel}
            isRTL={isRTL}
          />
          
          <NphiesIntegration 
            userRole={userRole.role}
            isRTL={isRTL}
          />
        </motion.div>

        {/* MEDICAL: FHIR R4 compliance dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="glass-morphism rounded-2xl p-6 mb-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            🔬 FHIR R4 Clinical Data Exchange
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Patient Records</h3>
              <p className="text-blue-200 text-sm mb-3">FHIR Patient resources with PHI encryption</p>
              <div className="text-2xl font-bold text-teal-400">2,847</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Active Claims</h3>
              <p className="text-orange-200 text-sm mb-3">NPHIES integrated claim processing</p>
              <div className="text-2xl font-bold text-orange-400">156</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-2">AI Accuracy</h3>
              <p className="text-purple-200 text-sm mb-3">Medical transcription & imaging</p>
              <div className="text-2xl font-bold text-purple-400">97.2%</div>
            </div>
          </div>
        </motion.div>

        {/* BRAINSAIT: Security audit log */}
        <SecurityAuditLog 
          userRole={userRole.role}
          complianceLevel={userRole.complianceLevel}
          isRTL={isRTL}
        />

        {/* MEDICAL: Healthcare workflow actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="glass-morphism rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            🚀 Healthcare Workflows
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🔬', label: 'Lab Results', endpoint: '/api/fhir/observation' },
              { icon: '🏥', label: 'Admissions', endpoint: '/api/fhir/encounter' },
              { icon: '💊', label: 'Medications', endpoint: '/api/fhir/medication' },
              { icon: '📋', label: 'Care Plans', endpoint: '/api/fhir/careplan' }
            ].map((workflow, index) => (
              <motion.button
                key={workflow.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button p-4 rounded-xl text-center hover:bg-white/10 transition-all"
                onClick={() => {
                  // BRAINSAIT: Audit log workflow access
                  fetch('/api/security/audit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'workflow_access',
                      resource: workflow.endpoint,
                      userRole: userRole.role,
                      timestamp: new Date().toISOString()
                    })
                  });
                }}
              >
                <div className="text-3xl mb-2">{workflow.icon}</div>
                <div className="text-white font-medium">{workflow.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        
        .rtl {
          direction: rtl;
        }
        
        .ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
}
