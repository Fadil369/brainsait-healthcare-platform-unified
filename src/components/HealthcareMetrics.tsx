/**
 * BRAINSAIT: Real-time Healthcare Metrics Dashboard
 * MEDICAL: FHIR R4 compliant metrics with audit logging
 * NEURAL: Glass morphism with animated counters
 */

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HealthcareMetricsProps {
  metrics: {
    activeUsers: number;
    processingClaims: number;
    aiAccuracy: number;
    complianceScore: number;
  };
  userRole: 'admin' | 'provider' | 'patient' | 'auditor';
  isRTL: boolean;
}

export function HealthcareMetrics({ metrics, userRole, isRTL }: HealthcareMetricsProps) {
  const [animatedMetrics, setAnimatedMetrics] = useState(metrics);

  useEffect(() => {
    // Animate counters
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const animate = (key: keyof typeof metrics, target: number) => {
      let current = 0;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        setAnimatedMetrics(prev => ({
          ...prev,
          [key]: Math.round(current)
        }));
      }, stepDuration);
    };

    Object.entries(metrics).forEach(([key, value]) => {
      animate(key as keyof typeof metrics, value);
    });
  }, [metrics]);

  const metricsConfig = [
    {
      key: 'activeUsers',
      icon: '👥',
      label: isRTL ? 'المستخدمون النشطون' : 'Active Users',
      value: animatedMetrics.activeUsers,
      color: 'from-blue-500 to-teal-500',
      suffix: ''
    },
    {
      key: 'processingClaims',
      icon: '📋',
      label: isRTL ? 'المطالبات قيد المعالجة' : 'Processing Claims',
      value: animatedMetrics.processingClaims,
      color: 'from-orange-500 to-red-500',
      suffix: ''
    },
    {
      key: 'aiAccuracy',
      icon: '🤖',
      label: isRTL ? 'دقة الذكاء الاصطناعي' : 'AI Accuracy',
      value: animatedMetrics.aiAccuracy,
      color: 'from-purple-500 to-pink-500',
      suffix: '%'
    },
    {
      key: 'complianceScore',
      icon: '🔒',
      label: isRTL ? 'نقاط الامتثال' : 'Compliance Score',
      value: animatedMetrics.complianceScore,
      color: 'from-green-500 to-emerald-500',
      suffix: '%'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {metricsConfig.map((metric, index) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          className="glass-morphism rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-2xl">{metric.icon}</span>
            </div>
            
            {userRole === 'admin' && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="text-3xl font-bold text-white mb-2">
            {metric.value.toLocaleString()}{metric.suffix}
          </div>
          
          <div className="text-sm text-blue-200">
            {metric.label}
          </div>
          
          {/* MEDICAL: Compliance indicator */}
          {metric.key === 'complianceScore' && (
            <div className="mt-3 flex items-center space-x-2">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className={`h-full bg-gradient-to-r ${metric.color} rounded-full`}
                />
              </div>
              <span className="text-xs text-green-300">HIPAA</span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
