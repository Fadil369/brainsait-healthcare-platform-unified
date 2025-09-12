/**
 * BRAINSAIT: Compliance Status Indicator
 * MEDICAL: HIPAA & NPHIES compliance monitoring
 */

'use client';

import { motion } from 'framer-motion';

interface ComplianceStatusProps {
  level: 'basic' | 'hipaa' | 'nphies';
  userRole: 'admin' | 'provider' | 'patient' | 'auditor';
}

export function ComplianceStatus({ level, userRole }: ComplianceStatusProps) {
  const getComplianceConfig = () => {
    switch (level) {
      case 'nphies':
        return {
          color: 'from-orange-500 to-red-500',
          text: 'NPHIES',
          icon: '🇸🇦',
          description: 'Saudi National Platform'
        };
      case 'hipaa':
        return {
          color: 'from-blue-500 to-teal-500',
          text: 'HIPAA',
          icon: '🔒',
          description: 'Healthcare Privacy'
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          text: 'Basic',
          icon: '⚡',
          description: 'Standard Security'
        };
    }
  };

  const config = getComplianceConfig();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r ${config.color} bg-opacity-20 border border-white/20`}
    >
      <span className="text-lg">{config.icon}</span>
      <div>
        <div className="text-white font-medium text-sm">{config.text}</div>
        <div className="text-xs text-white/70">{config.description}</div>
      </div>
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
    </motion.div>
  );
}
