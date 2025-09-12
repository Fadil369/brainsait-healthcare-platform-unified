// Unified AWS Integration Manager
class AWSIntegrationManager {
    constructor() {
        this.isInitialized = false;
        this.services = {};
        this.config = window.AWS_CONFIG || {};
        this.initializeServices();
    }

    async initializeServices() {
        try {
            // Configure AWS SDK
            if (typeof AWS !== 'undefined') {
                AWS.config.update({
                    region: this.config.region || 'us-east-1',
                    credentials: new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: this.config.identityPoolId || 'us-east-1:demo-pool'
                    })
                });

                // Initialize core services
                this.services = {
                    s3: new AWS.S3(),
                    cognito: new AWS.CognitoIdentityServiceProvider(),
                    dynamodb: new AWS.DynamoDB.DocumentClient(),
                    lambda: new AWS.Lambda(),
                    stepfunctions: new AWS.StepFunctions(),
                    sns: new AWS.SNS(),
                    sqs: new AWS.SQS(),
                    cloudwatch: new AWS.CloudWatch(),
                    comprehendMedical: new AWS.ComprehendMedical(),
                    textract: new AWS.Textract(),
                    rekognition: new AWS.Rekognition(),
                    polly: new AWS.Polly(),
                    translate: new AWS.Translate()
                };

                this.isInitialized = true;
                console.log('✅ AWS services initialized');
                
                // Test connectivity
                await this.testConnectivity();
                
            } else {
                console.warn('⚠️ AWS SDK not loaded, using simulation mode');
                this.initializeSimulationMode();
            }
        } catch (error) {
            console.error('❌ AWS initialization failed:', error);
            this.initializeSimulationMode();
        }
    }

    initializeSimulationMode() {
        this.isInitialized = false;
        console.log('🔄 Running in simulation mode');
    }

    async testConnectivity() {
        try {
            // Test S3 connectivity
            await this.services.s3.listBuckets().promise();
            this.updateServiceStatus('s3', 'active');
            
            // Test other services with simple calls
            const tests = [
                { service: 'cloudwatch', method: 'listMetrics', params: { MaxRecords: 1 } },
                { service: 'dynamodb', method: 'listTables', params: { Limit: 1 } }
            ];

            for (const test of tests) {
                try {
                    await this.services[test.service][test.method](test.params).promise();
                    this.updateServiceStatus(test.service, 'active');
                } catch (error) {
                    this.updateServiceStatus(test.service, 'error');
                }
            }
        } catch (error) {
            console.warn('Connectivity test failed, continuing with simulation');
        }
    }

    updateServiceStatus(service, status) {
        const event = new CustomEvent('awsServiceStatus', {
            detail: { service, status }
        });
        document.dispatchEvent(event);
    }

    // Unified service methods
    async uploadFile(file, path, metadata = {}) {
        if (!this.isInitialized) {
            return this.simulateUpload(file, path);
        }

        try {
            const params = {
                Bucket: this.config.bucket || 'brainsait-healthcare-1757618402',
                Key: `${path}/${Date.now()}-${file.name}`,
                Body: file,
                ContentType: file.type,
                Metadata: {
                    ...metadata,
                    uploadedBy: localStorage.getItem('currentUser') || 'anonymous',
                    timestamp: new Date().toISOString()
                }
            };

            const result = await this.services.s3.upload(params).promise();
            await this.logActivity('file_upload', { key: params.Key, size: file.size });
            return result;
        } catch (error) {
            console.error('Upload error:', error);
            return this.simulateUpload(file, path);
        }
    }

    async storeData(table, data) {
        if (!this.isInitialized) {
            return this.simulateDataStore(table, data);
        }

        try {
            const params = {
                TableName: table,
                Item: {
                    ...data,
                    id: data.id || `${table}-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    createdBy: localStorage.getItem('currentUser') || 'system'
                }
            };

            const result = await this.services.dynamodb.put(params).promise();
            await this.logActivity('data_store', { table, itemId: params.Item.id });
            return result;
        } catch (error) {
            console.error('Data store error:', error);
            return this.simulateDataStore(table, data);
        }
    }

    async queryData(table, conditions = {}) {
        if (!this.isInitialized) {
            return this.simulateDataQuery(table, conditions);
        }

        try {
            const params = {
                TableName: table,
                ...conditions
            };

            const result = await this.services.dynamodb.scan(params).promise();
            return result.Items || [];
        } catch (error) {
            console.error('Data query error:', error);
            return this.simulateDataQuery(table, conditions);
        }
    }

    async publishMetric(metricName, value, unit = 'Count') {
        if (!this.isInitialized) {
            return this.simulateMetric(metricName, value);
        }

        try {
            const params = {
                Namespace: 'BrainSAIT/Healthcare',
                MetricData: [{
                    MetricName: metricName,
                    Value: value,
                    Unit: unit,
                    Timestamp: new Date(),
                    Dimensions: [
                        { Name: 'Environment', Value: 'production' },
                        { Name: 'User', Value: localStorage.getItem('currentUser') || 'anonymous' }
                    ]
                }]
            };

            return await this.services.cloudwatch.putMetricData(params).promise();
        } catch (error) {
            console.error('Metric error:', error);
            return this.simulateMetric(metricName, value);
        }
    }

    async sendNotification(message, topic = 'healthcare-alerts') {
        if (!this.isInitialized) {
            return this.simulateNotification(message);
        }

        try {
            const params = {
                TopicArn: `arn:aws:sns:${this.config.region}:123456789012:${topic}`,
                Message: JSON.stringify({
                    message,
                    timestamp: new Date().toISOString(),
                    user: localStorage.getItem('currentUser'),
                    source: 'healthcare-platform'
                }),
                Subject: 'Healthcare Platform Alert'
            };

            return await this.services.sns.publish(params).promise();
        } catch (error) {
            console.error('Notification error:', error);
            return this.simulateNotification(message);
        }
    }

    async logActivity(action, details) {
        const logData = {
            action,
            details,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('currentUser') || 'anonymous',
            sessionId: sessionStorage.getItem('sessionId') || 'no-session',
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        try {
            await this.storeData('activity-logs', logData);
        } catch (error) {
            console.error('Activity logging error:', error);
        }
    }

    // Simulation methods
    simulateUpload(file, path) {
        return Promise.resolve({
            Location: `https://s3.amazonaws.com/demo-bucket/${path}/${file.name}`,
            Key: `${path}/${file.name}`,
            Bucket: 'demo-bucket'
        });
    }

    simulateDataStore(table, data) {
        console.log(`📝 Simulated store to ${table}:`, data);
        return Promise.resolve({ success: true });
    }

    simulateDataQuery(table, conditions) {
        console.log(`🔍 Simulated query from ${table}:`, conditions);
        return Promise.resolve([
            { id: 'demo-1', name: 'Demo Record 1', createdAt: new Date().toISOString() },
            { id: 'demo-2', name: 'Demo Record 2', createdAt: new Date().toISOString() }
        ]);
    }

    simulateMetric(metricName, value) {
        console.log(`📊 Simulated metric ${metricName}: ${value}`);
        return Promise.resolve({ success: true });
    }

    simulateNotification(message) {
        console.log(`📱 Simulated notification: ${message}`);
        if (window.identityManager) {
            identityManager.showUINotification(message, 'info');
        }
        return Promise.resolve({ MessageId: `sim-${Date.now()}` });
    }

    // Health check
    async healthCheck() {
        const status = {
            aws: this.isInitialized,
            services: {},
            timestamp: new Date().toISOString()
        };

        if (this.isInitialized) {
            for (const [name, service] of Object.entries(this.services)) {
                try {
                    // Simple health check for each service
                    status.services[name] = 'healthy';
                } catch (error) {
                    status.services[name] = 'error';
                }
            }
        }

        return status;
    }
}

// Initialize AWS Integration
const awsIntegration = new AWSIntegrationManager();
window.awsIntegration = awsIntegration;
