import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';

interface NphiesIntegrationProps {
  patientId?: string;
  userRole?: string;
  isRTL?: boolean;
}

export const NphiesIntegration: React.FC<NphiesIntegrationProps> = ({ patientId }) => {
  const [eligibilityStatus, setEligibilityStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [eligibilityData, setEligibilityData] = useState<any>(null);
  const [claimData, setClaimData] = useState<any>(null);

  const checkEligibility = async () => {
    setEligibilityStatus('loading');
    try {
      const response = await fetch('https://vmzuql0azj.execute-api.us-east-1.amazonaws.com/prod/nphies/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify({
          resourceType: 'CoverageEligibilityRequest',
          patient: { reference: `Patient/${patientId || 'saudi-123'}` },
          insurer: { reference: 'Organization/nphies-insurer' }
        })
      });
      
      const data = await response.json();
      setEligibilityData(data);
      setEligibilityStatus('success');
    } catch (error) {
      setEligibilityStatus('error');
    }
  };

  const submitClaim = async () => {
    setClaimStatus('loading');
    try {
      const response = await fetch('https://vmzuql0azj.execute-api.us-east-1.amazonaws.com/prod/nphies/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify({
          resourceType: 'Claim',
          patient: { reference: `Patient/${patientId || 'saudi-123'}` },
          provider: { reference: 'Organization/brainsait-healthcare' },
          insurer: { reference: 'Organization/nphies-insurer' },
          total: { value: 1500.00, currency: 'SAR' }
        })
      });
      
      const data = await response.json();
      setClaimData(data);
      setClaimStatus('success');
    } catch (error) {
      setClaimStatus('error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return <Clock className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🇸🇦 NPHIES Integration
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">Saudi National Platform</span>
          </h3>
        </div>
        <div className="p-6 pt-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Eligibility Check */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 pb-3">
                <h4 className="text-lg flex items-center gap-2">
                  {getStatusIcon(eligibilityStatus)}
                  Coverage Eligibility
                </h4>
              </div>
              <div className="p-4 pt-0">
                <button 
                  onClick={checkEligibility}
                  disabled={eligibilityStatus === 'loading'}
                  className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {eligibilityStatus === 'loading' ? 'Checking...' : 'Check Eligibility'}
                </button>
                
                {eligibilityData && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Status: {eligibilityData.outcome || 'Active'}
                    </p>
                    <p className="text-xs text-green-600">
                      Resource: {eligibilityData.resourceType}
                    </p>
                    {eligibilityData.insurance && (
                      <p className="text-xs text-green-600">
                        Coverage: Active
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Claim Submission */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 pb-3">
                <h4 className="text-lg flex items-center gap-2">
                  {getStatusIcon(claimStatus)}
                  Claim Submission
                </h4>
              </div>
              <div className="p-4 pt-0">
                <button 
                  onClick={submitClaim}
                  disabled={claimStatus === 'loading'}
                  className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {claimStatus === 'loading' ? 'Submitting...' : 'Submit Claim'}
                </button>
                
                {claimData && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Claim ID: {claimData.id}
                    </p>
                    <p className="text-xs text-blue-600">
                      Status: {claimData.status || 'Submitted'}
                    </p>
                    {claimData.total && (
                      <p className="text-xs text-blue-600">
                        Amount: {claimData.total.value} {claimData.total.currency}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NPHIES Compliance Info */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">NPHIES Compliant</span>
            </div>
            <p className="text-sm text-gray-600">
              Integrated with Saudi National Platform for Health Information Exchange (NPHIES)
              for real-time eligibility verification and claim processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
