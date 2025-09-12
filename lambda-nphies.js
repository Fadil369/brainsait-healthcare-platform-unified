exports.handler = async (event) => {
    const { httpMethod, path, body } = event;
    
    const nphiesBaseUrl = process.env.NPHIES_BASE_URL || 'https://nphies.sa/fhir/R4';
    
    try {
        let response;
        
        if (path.includes('/eligibility')) {
            response = {
                resourceType: 'CoverageEligibilityResponse',
                id: 'eligibility-' + Date.now(),
                status: 'active',
                purpose: ['validation'],
                patient: {
                    reference: 'Patient/saudi-patient-123'
                },
                created: new Date().toISOString(),
                insurer: {
                    reference: 'Organization/nphies-insurer'
                },
                outcome: 'complete',
                insurance: [{
                    coverage: {
                        reference: 'Coverage/saudi-coverage-123'
                    },
                    inforce: true,
                    benefitPeriod: {
                        start: '2025-01-01',
                        end: '2025-12-31'
                    }
                }]
            };
        } else if (path.includes('/claim')) {
            if (httpMethod === 'POST') {
                response = {
                    resourceType: 'Claim',
                    id: 'claim-' + Date.now(),
                    status: 'active',
                    type: {
                        coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/claim-type',
                            code: 'institutional'
                        }]
                    },
                    use: 'claim',
                    patient: {
                        reference: 'Patient/saudi-patient-123'
                    },
                    created: new Date().toISOString(),
                    insurer: {
                        reference: 'Organization/nphies-insurer'
                    },
                    provider: {
                        reference: 'Organization/brainsait-healthcare'
                    },
                    priority: {
                        coding: [{
                            system: 'http://terminology.hl7.org/CodeSystem/processpriority',
                            code: 'normal'
                        }]
                    },
                    total: {
                        value: 1500.00,
                        currency: 'SAR'
                    }
                };
            } else {
                response = {
                    resourceType: 'Claim',
                    id: 'claim-123',
                    status: 'active',
                    outcome: 'complete'
                };
            }
        } else {
            response = {
                resourceType: 'OperationOutcome',
                issue: [{
                    severity: 'error',
                    code: 'not-found',
                    details: {
                        text: 'NPHIES endpoint not found'
                    }
                }]
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/fhir+json',
                'Access-Control-Allow-Origin': '*',
                'X-NPHIES-Compliant': 'true',
                'X-Healthcare-Platform': 'BrainSAIT-v2.0'
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/fhir+json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                resourceType: 'OperationOutcome',
                issue: [{
                    severity: 'error',
                    code: 'exception',
                    details: {
                        text: 'NPHIES integration error'
                    }
                }]
            })
        };
    }
};
