/**
 * BRAINSAIT: AI Healthcare Services Grid
 * MEDICAL: FHIR R4 compliant AI services
 * AGENT: Multi-agent AI workflow orchestration
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AIServicesGridProps {
  userRole: 'admin' | 'provider' | 'patient' | 'auditor';
  complianceLevel: 'basic' | 'hipaa' | 'nphies';
  isRTL: boolean;
}

export function AIServicesGrid({ userRole, complianceLevel, isRTL }: AIServicesGridProps) {
  const [activeService, setActiveService] = useState<string | null>(null);

  const aiServices = [
    {
      id: 'transcription',
      icon: '🎤',
      title: isRTL ? 'النسخ الطبي' : 'Medical Transcription',
      description: isRTL ? 'دقة 97.2% مع النماذج المتخصصة' : '97.2% accuracy with specialty models',
      accuracy: 97.2,
      endpoint: '/api/ai/transcription',
      fhirResource: 'DocumentReference',
      permissions: ['read:transcription', 'write:transcription']
    },
    {
      id: 'imaging',
      icon: '🔬',
      title: isRTL ? 'تحليل الصور الطبية' : 'Medical Imaging Analysis',
      description: isRTL ? 'تحليل DICOM بدقة 96.8%' : 'DICOM analysis with 96.8% accuracy',
      accuracy: 96.8,
      endpoint: '/api/ai/imaging',
      fhirResource: 'ImagingStudy',
      permissions: ['read:imaging', 'write:imaging']
    },
    {
      id: 'nlp',
      icon: '📝',
      title: isRTL ? 'استخراج الكيانات الطبية' : 'Medical Entity Extraction',
      description: isRTL ? 'معالجة اللغة الطبيعية السريرية' : 'Clinical NLP with PHI detection',
      accuracy: 94.5,
      endpoint: '/api/ai/nlp',
      fhirResource: 'Observation',
      permissions: ['read:nlp', 'write:nlp']
    },
    {
      id: 'claims',
      icon: '💳',
      title: isRTL ? 'معالجة المطالبات' : 'Claims Processing',
      description: isRTL ? 'التحقق المدعوم بالذكاء الاصطناعي' : 'AI-powered validation',
      accuracy: 98.5,
      endpoint: '/api/ai/claims',
      fhirResource: 'Claim',
      permissions: ['read:claims', 'write:claims']
    }
  ];

  const handleServiceClick = async (service: typeof aiServices[0]) => {
    setActiveService(service.id);
    
    // BRAINSAIT: Audit log AI service access
    await fetch('/api/security/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai_service_access',
        resource: service.endpoint,
        fhirResource: service.fhirResource,
        userRole,
        complianceLevel,
        timestamp: new Date().toISOString(),
        sessionId: crypto.randomUUID()
      })
    });

    // Simulate service activation
    setTimeout(() => setActiveService(null), 2000);
  };

  return (
    <div className="glass-morphism rounded-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3">🤖</span>
        {isRTL ? 'خدمات الذكاء الاصطناعي الطبية' : 'AI Healthcare Services'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all ${
              activeService === service.id 
                ? 'bg-gradient-to-br from-blue-500/30 to-teal-500/30 border-2 border-teal-400' 
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            onClick={() => handleServiceClick(service)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* NEURAL: Service activation animation */}
            {activeService === service.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-blue-500/20 rounded-xl"
              />
            )}
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{service.icon}</div>
                <div className="text-right">
                  <div className="text-sm text-teal-300 font-medium">
                    {service.accuracy}%
                  </div>
                  <div className="text-xs text-blue-200">
                    {isRTL ? 'دقة' : 'Accuracy'}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {service.title}
              </h3>
              
              <p className="text-sm text-blue-200 mb-3">
                {service.description}
              </p>
              
              {/* MEDICAL: FHIR resource indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-300">
                    FHIR {service.fhirResource}
                  </span>
                </div>
                
                {complianceLevel === 'nphies' && (
                  <div className="text-xs text-orange-300 bg-orange-500/20 px-2 py-1 rounded">
                    NPHIES
                  </div>
                )}
              </div>
              
              {/* BRAINSAIT: Processing indicator */}
              {activeService === service.id && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* AGENT: AI workflow status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">
              {isRTL ? 'حالة وكلاء الذكاء الاصطناعي' : 'AI Agents Status'}
            </h4>
            <p className="text-sm text-purple-200">
              {isRTL ? 'جميع الوكلاء نشطون ومتوافقون' : 'All agents active and compliant'}
            </p>
          </div>
          <div className="flex space-x-2">
            {['MASTERLINC', 'HEALTHCARELINC', 'CLINICALLINC'].map((agent) => (
              <div key={agent} className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
