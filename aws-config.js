// AWS Configuration and SDK Integration
// This file provides AWS service configuration for the BrainSAIT Healthcare Platform

// AWS SDK Configuration
const AWS_REGION = 'us-east-1';
const S3_BUCKET = 'brainsait-healthcare-1757618402';

// Initialize AWS SDK (when available)
if (typeof AWS !== 'undefined') {
    AWS.config.update({
        region: AWS_REGION,
        credentials: new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:demo-pool-id' // Demo pool for testing
        })
    });
}

// AWS Service Endpoints
const AWS_ENDPOINTS = {
    comprehendMedical: `https://comprehendmedical.${AWS_REGION}.amazonaws.com`,
    textract: `https://textract.${AWS_REGION}.amazonaws.com`,
    transcribe: `https://transcribe.${AWS_REGION}.amazonaws.com`,
    bedrock: `https://bedrock-runtime.${AWS_REGION}.amazonaws.com`,
    s3: `https://s3.${AWS_REGION}.amazonaws.com`,
    cloudWatch: `https://monitoring.${AWS_REGION}.amazonaws.com`
};

// Healthcare-specific AWS service configurations
const HEALTHCARE_CONFIG = {
    // Medical transcription settings
    transcription: {
        languageCode: 'en-US',
        mediaFormat: 'wav',
        vocabularyName: 'medical-vocabulary',
        contentRedaction: {
            redactionType: 'PII',
            redactionOutput: 'redacted'
        }
    },
    
    // Medical entity extraction settings
    entityExtraction: {
        languageCode: 'en',
        entityTypes: [
            'MEDICATION',
            'MEDICAL_CONDITION',
            'ANATOMY',
            'TEST_TREATMENT_PROCEDURE',
            'PROTECTED_HEALTH_INFORMATION'
        ]
    },
    
    // DICOM analysis settings
    imaging: {
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        maxTokens: 1000,
        temperature: 0.1
    },
    
    // CloudWatch metrics
    metrics: {
        namespace: 'BrainSAIT/Healthcare',
        dimensions: [
            { Name: 'Environment', Value: 'production' },
            { Name: 'Service', Value: 'healthcare-platform' }
        ]
    }
};

// HIPAA compliance settings
const COMPLIANCE_CONFIG = {
    encryption: {
        algorithm: 'AES-256',
        keyRotation: 90 // days
    },
    auditLogging: {
        enabled: true,
        retention: 2555 // days (7 years)
    },
    dataClassification: {
        phi: 'protected',
        pii: 'restricted',
        medical: 'confidential'
    }
};

// Export configurations for use in main application
window.AWS_CONFIG = {
    region: AWS_REGION,
    bucket: S3_BUCKET,
    endpoints: AWS_ENDPOINTS,
    healthcare: HEALTHCARE_CONFIG,
    compliance: COMPLIANCE_CONFIG
};

console.log('AWS configuration loaded for BrainSAIT Healthcare Platform');
