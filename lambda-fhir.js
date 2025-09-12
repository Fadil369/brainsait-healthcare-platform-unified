exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/fhir+json',
            'Access-Control-Allow-Origin': '*',
            'X-HIPAA-Compliant': 'true',
            'X-Healthcare-Platform': 'BrainSAIT-v2.0'
        },
        body: JSON.stringify({
            resourceType: 'CapabilityStatement',
            id: 'brainsait-healthcare-platform',
            status: 'active',
            date: new Date().toISOString(),
            publisher: 'BrainSAIT Healthcare Platform',
            kind: 'instance',
            software: {
                name: 'BrainSAIT Healthcare Platform',
                version: '2.0.0'
            },
            implementation: {
                description: 'BrainSAIT Healthcare Platform FHIR R4 Server',
                url: 'https://d3oif6xq7fxrff.cloudfront.net'
            },
            fhirVersion: '4.0.1',
            format: ['application/fhir+json', 'application/fhir+xml'],
            rest: [{
                mode: 'server',
                resource: [{
                    type: 'Patient',
                    interaction: [
                        { code: 'read' },
                        { code: 'search-type' }
                    ]
                }]
            }]
        })
    };
    return response;
};
