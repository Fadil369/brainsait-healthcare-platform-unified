#!/usr/bin/env node

/**
 * BrainSAIT Healthcare Platform - Deployment Validation
 * Validates deployment health, security, and compliance
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  timeout: 30000,
  retries: 3,
  healthEndpoints: [
    '/api/health',
    '/api/fhir/metadata',
    '/'
  ],
  securityHeaders: [
    'x-frame-options',
    'x-content-type-options',
    'strict-transport-security',
    'x-hipaa-compliant',
    'content-security-policy'
  ],
  performanceThresholds: {
    responseTime: 2000, // 2 seconds
    ttfb: 1000, // 1 second
    loadTime: 3000 // 3 seconds
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logInfo(message) { log(`ℹ️  ${message}`, 'blue'); }
function logSuccess(message) { log(`✅ ${message}`, 'green'); }
function logWarning(message) { log(`⚠️  ${message}`, 'yellow'); }
function logError(message) { log(`❌ ${message}`, 'red'); }
function logStep(message) { log(`🔄 ${message}`, 'magenta'); }

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      timeout: CONFIG.timeout,
      ...options
    }, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime,
          url: url
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    });
    
    req.end();
  });
}

// Validate health endpoints
async function validateHealthEndpoints(baseUrl) {
  logStep('Validating health endpoints...');
  
  const results = [];
  
  for (const endpoint of CONFIG.healthEndpoints) {
    const url = `${baseUrl}${endpoint}`;
    
    try {
      const response = await makeRequest(url);
      const isHealthy = response.statusCode >= 200 && response.statusCode < 400;
      
      results.push({
        endpoint: endpoint,
        url: url,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        healthy: isHealthy,
        data: response.data
      });
      
      if (isHealthy) {
        logSuccess(`${endpoint}: ${response.statusCode} (${response.responseTime}ms)`);
      } else {
        logError(`${endpoint}: ${response.statusCode} (${response.responseTime}ms)`);
      }
    } catch (error) {
      logError(`${endpoint}: ${error.message}`);
      results.push({
        endpoint: endpoint,
        url: url,
        healthy: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Validate security headers
async function validateSecurityHeaders(baseUrl) {
  logStep('Validating security headers...');
  
  try {
    const response = await makeRequest(baseUrl);
    const headers = response.headers;
    const results = [];
    
    for (const header of CONFIG.securityHeaders) {
      const value = headers[header] || headers[header.toLowerCase()];
      const present = !!value;
      
      results.push({
        header: header,
        present: present,
        value: value
      });
      
      if (present) {
        logSuccess(`${header}: ${value}`);
      } else {
        logWarning(`${header}: Missing`);
      }
    }
    
    // Check for HIPAA compliance header
    const hipaaCompliant = headers['x-hipaa-compliant'] === 'true';
    if (hipaaCompliant) {
      logSuccess('HIPAA compliance header verified');
    } else {
      logWarning('HIPAA compliance header missing or invalid');
    }
    
    return results;
  } catch (error) {
    logError(`Security header validation failed: ${error.message}`);
    return [];
  }
}

// Validate performance
async function validatePerformance(baseUrl) {
  logStep('Validating performance...');
  
  const results = [];
  
  try {
    // Test multiple requests to get average
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(makeRequest(baseUrl));
    }
    
    const responses = await Promise.all(requests);
    const responseTimes = responses.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    
    results.push({
      metric: 'Average Response Time',
      value: averageResponseTime,
      threshold: CONFIG.performanceThresholds.responseTime,
      passed: averageResponseTime < CONFIG.performanceThresholds.responseTime
    });
    
    results.push({
      metric: 'Max Response Time',
      value: maxResponseTime,
      threshold: CONFIG.performanceThresholds.responseTime,
      passed: maxResponseTime < CONFIG.performanceThresholds.responseTime
    });
    
    // Log results
    results.forEach(result => {
      const status = result.passed ? '✅' : '⚠️';
      log(`${status} ${result.metric}: ${result.value.toFixed(0)}ms (threshold: ${result.threshold}ms)`);
    });
    
    return results;
  } catch (error) {
    logError(`Performance validation failed: ${error.message}`);
    return [];
  }
}

// Validate SSL/TLS
async function validateSSL(baseUrl) {
  logStep('Validating SSL/TLS configuration...');
  
  if (!baseUrl.startsWith('https:')) {
    logWarning('URL is not HTTPS - SSL validation skipped');
    return { ssl: false, reason: 'Not HTTPS' };
  }
  
  try {
    const response = await makeRequest(baseUrl);
    
    // Check if request succeeded over HTTPS
    const sslValid = response.statusCode >= 200 && response.statusCode < 400;
    
    if (sslValid) {
      logSuccess('SSL/TLS certificate is valid');
      return { ssl: true, valid: true };
    } else {
      logWarning('SSL/TLS validation inconclusive');
      return { ssl: true, valid: false };
    }
  } catch (error) {
    if (error.message.includes('certificate') || error.message.includes('SSL')) {
      logError(`SSL/TLS error: ${error.message}`);
      return { ssl: true, valid: false, error: error.message };
    } else {
      logWarning(`SSL/TLS validation failed: ${error.message}`);
      return { ssl: true, valid: false, error: error.message };
    }
  }
}

// Validate AWS resources
async function validateAWSResources() {
  logStep('Validating AWS resources...');
  
  const results = {
    cloudformation: false,
    s3: false,
    lambda: false,
    apigateway: false,
    cloudfront: false
  };
  
  try {
    // Check CloudFormation stack
    try {
      execSync('aws cloudformation describe-stacks --stack-name brainsait-healthcare-freetier', { stdio: 'pipe' });
      results.cloudformation = true;
      logSuccess('CloudFormation stack exists');
    } catch (error) {
      logWarning('CloudFormation stack not found or inaccessible');
    }
    
    // Check S3 buckets
    try {
      const buckets = execSync('aws s3 ls', { encoding: 'utf8' });
      if (buckets.includes('brainsait-healthcare')) {
        results.s3 = true;
        logSuccess('S3 bucket found');
      } else {
        logWarning('S3 bucket not found');
      }
    } catch (error) {
      logWarning('S3 validation failed');
    }
    
    // Check Lambda functions
    try {
      const functions = execSync('aws lambda list-functions', { encoding: 'utf8' });
      if (functions.includes('brainsait-healthcare')) {
        results.lambda = true;
        logSuccess('Lambda function found');
      } else {
        logWarning('Lambda function not found');
      }
    } catch (error) {
      logWarning('Lambda validation failed');
    }
    
    // Check API Gateway
    try {
      const apis = execSync('aws apigateway get-rest-apis', { encoding: 'utf8' });
      if (apis.includes('brainsait-healthcare')) {
        results.apigateway = true;
        logSuccess('API Gateway found');
      } else {
        logWarning('API Gateway not found');
      }
    } catch (error) {
      logWarning('API Gateway validation failed');
    }
    
    // Check CloudFront distributions
    try {
      const distributions = execSync('aws cloudfront list-distributions', { encoding: 'utf8' });
      if (distributions.includes('BrainSAIT Healthcare')) {
        results.cloudfront = true;
        logSuccess('CloudFront distribution found');
      } else {
        logWarning('CloudFront distribution not found');
      }
    } catch (error) {
      logWarning('CloudFront validation failed');
    }
    
  } catch (error) {
    logError('AWS CLI not available or not configured');
  }
  
  return results;
}

// Generate validation report
function generateValidationReport(results) {
  const timestamp = new Date().toISOString();
  
  let report = `# BrainSAIT Healthcare Platform - Deployment Validation Report

Generated: ${timestamp}

## 🏥 Platform Overview
- **Platform**: BrainSAIT Healthcare Platform v2.0
- **Deployment**: AWS Free Tier Optimized
- **Validation Date**: ${timestamp}

## 📊 Validation Results

`;

  // Health endpoints
  if (results.health) {
    report += `### Health Endpoints
`;
    results.health.forEach(endpoint => {
      const status = endpoint.healthy ? '✅' : '❌';
      report += `${status} **${endpoint.endpoint}**: ${endpoint.statusCode || 'Error'} (${endpoint.responseTime || 'N/A'}ms)\n`;
    });
    report += '\n';
  }

  // Security headers
  if (results.security) {
    report += `### Security Headers
`;
    results.security.forEach(header => {
      const status = header.present ? '✅' : '⚠️';
      report += `${status} **${header.header}**: ${header.value || 'Missing'}\n`;
    });
    report += '\n';
  }

  // Performance
  if (results.performance) {
    report += `### Performance Metrics
`;
    results.performance.forEach(metric => {
      const status = metric.passed ? '✅' : '⚠️';
      report += `${status} **${metric.metric}**: ${metric.value.toFixed(0)}ms (threshold: ${metric.threshold}ms)\n`;
    });
    report += '\n';
  }

  // SSL/TLS
  if (results.ssl) {
    const status = results.ssl.valid ? '✅' : '⚠️';
    report += `### SSL/TLS Configuration
${status} **SSL/TLS**: ${results.ssl.valid ? 'Valid' : 'Invalid or Not HTTPS'}
`;
    if (results.ssl.error) {
      report += `Error: ${results.ssl.error}\n`;
    }
    report += '\n';
  }

  // AWS Resources
  if (results.aws) {
    report += `### AWS Resources
`;
    Object.entries(results.aws).forEach(([resource, exists]) => {
      const status = exists ? '✅' : '⚠️';
      report += `${status} **${resource.toUpperCase()}**: ${exists ? 'Found' : 'Not Found'}\n`;
    });
    report += '\n';
  }

  // Overall status
  const healthyEndpoints = results.health ? results.health.filter(e => e.healthy).length : 0;
  const totalEndpoints = results.health ? results.health.length : 0;
  const securityHeaders = results.security ? results.security.filter(h => h.present).length : 0;
  const totalHeaders = results.security ? results.security.length : 0;
  const performanceTests = results.performance ? results.performance.filter(p => p.passed).length : 0;
  const totalPerformance = results.performance ? results.performance.length : 0;

  report += `## 📈 Summary

- **Health Endpoints**: ${healthyEndpoints}/${totalEndpoints} passing
- **Security Headers**: ${securityHeaders}/${totalHeaders} present
- **Performance Tests**: ${performanceTests}/${totalPerformance} passing
- **SSL/TLS**: ${results.ssl && results.ssl.valid ? 'Valid' : 'Issues detected'}

## 🔧 Recommendations

`;

  const recommendations = [];
  
  if (healthyEndpoints < totalEndpoints) {
    recommendations.push('- Fix failing health endpoints');
  }
  
  if (securityHeaders < totalHeaders) {
    recommendations.push('- Add missing security headers');
  }
  
  if (performanceTests < totalPerformance) {
    recommendations.push('- Optimize performance for failing metrics');
  }
  
  if (!results.ssl || !results.ssl.valid) {
    recommendations.push('- Configure proper SSL/TLS certificate');
  }

  if (recommendations.length === 0) {
    report += '✅ All validation checks passed - deployment is healthy!\n';
  } else {
    recommendations.forEach(rec => report += `${rec}\n`);
  }

  report += `
## 🏥 HIPAA Compliance Status

${results.security && results.security.find(h => h.header === 'x-hipaa-compliant' && h.present) ? '✅' : '⚠️'} HIPAA compliance header present
${results.ssl && results.ssl.valid ? '✅' : '⚠️'} Encryption in transit (HTTPS)
${results.aws && results.aws.lambda ? '✅' : '⚠️'} Secure compute environment
${results.aws && results.aws.s3 ? '✅' : '⚠️'} Secure storage

---
*Generated by BrainSAIT Healthcare Platform Deployment Validator*
`;

  return report;
}

// Main validation function
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0];
  
  if (!baseUrl) {
    logError('Usage: node validate-deployment.js <base-url>');
    logError('Example: node validate-deployment.js https://d123456789.cloudfront.net');
    process.exit(1);
  }
  
  log('🏥 BrainSAIT Healthcare Platform - Deployment Validation', 'cyan');
  log('='.repeat(60), 'cyan');
  logInfo(`Validating deployment: ${baseUrl}`);
  
  const results = {};
  
  try {
    // Run all validations
    results.health = await validateHealthEndpoints(baseUrl);
    results.security = await validateSecurityHeaders(baseUrl);
    results.performance = await validatePerformance(baseUrl);
    results.ssl = await validateSSL(baseUrl);
    results.aws = await validateAWSResources();
    
    // Generate report
    const report = generateValidationReport(results);
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '..', 'deployment-validation-report.md');
    fs.writeFileSync(reportPath, report);
    
    logSuccess(`Validation report generated: ${reportPath}`);
    
    // Summary
    const healthyEndpoints = results.health.filter(e => e.healthy).length;
    const totalEndpoints = results.health.length;
    const securityHeaders = results.security.filter(h => h.present).length;
    const totalHeaders = results.security.length;
    
    log('\n📊 Validation Summary:', 'cyan');
    log(`✅ Health: ${healthyEndpoints}/${totalEndpoints} endpoints healthy`);
    log(`🔒 Security: ${securityHeaders}/${totalHeaders} headers present`);
    log(`⚡ Performance: ${results.performance.filter(p => p.passed).length}/${results.performance.length} tests passed`);
    log(`🔐 SSL/TLS: ${results.ssl.valid ? 'Valid' : 'Issues detected'}`);
    
    // Overall status
    const overallHealthy = healthyEndpoints === totalEndpoints && 
                          securityHeaders >= totalHeaders * 0.8 && 
                          results.ssl.valid;
    
    if (overallHealthy) {
      logSuccess('\n🎉 Deployment validation passed! Platform is healthy and secure.');
    } else {
      logWarning('\n⚠️  Deployment validation found issues. Review the report for details.');
    }
    
  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, validateHealthEndpoints, validateSecurityHeaders };
