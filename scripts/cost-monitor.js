#!/usr/bin/env node

/**
 * BrainSAIT Healthcare Platform - AWS Cost Monitor
 * Monitors AWS usage and costs to stay within free tier limits
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  stackName: 'brainsait-healthcare-freetier',
  alertThresholds: {
    s3Storage: 4.5, // GB (90% of 5GB free tier)
    lambdaInvocations: 900000, // 90% of 1M free tier
    dynamodbReads: 22.5, // 90% of 25 RCU
    dynamodbWrites: 22.5, // 90% of 25 WCU
    cloudFrontRequests: 9000000, // 90% of 10M free tier
    apiGatewayRequests: 900000 // 90% of 1M free tier
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

// Execute AWS CLI command
function awsCommand(command) {
  try {
    const result = execSync(`aws ${command} --region ${CONFIG.region}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return JSON.parse(result);
  } catch (error) {
    logError(`AWS command failed: ${command}`);
    logError(error.message);
    return null;
  }
}

// Get S3 usage
async function getS3Usage() {
  logStep('Checking S3 usage...');
  
  try {
    const buckets = awsCommand('s3api list-buckets');
    if (!buckets) return null;
    
    let totalSize = 0;
    const bucketDetails = [];
    
    for (const bucket of buckets.Buckets) {
      if (bucket.Name.includes('brainsait-healthcare')) {
        const size = awsCommand(`cloudwatch get-metric-statistics --namespace AWS/S3 --metric-name BucketSizeBytes --dimensions Name=BucketName,Value=${bucket.Name} Name=StorageType,Value=StandardStorage --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 86400 --statistics Average`);
        
        const sizeGB = size && size.Datapoints.length > 0 ? 
          (size.Datapoints[0].Average / (1024 * 1024 * 1024)).toFixed(2) : 0;
        
        bucketDetails.push({
          name: bucket.Name,
          sizeGB: parseFloat(sizeGB)
        });
        
        totalSize += parseFloat(sizeGB);
      }
    }
    
    return {
      totalSizeGB: totalSize,
      buckets: bucketDetails,
      threshold: CONFIG.alertThresholds.s3Storage,
      withinLimit: totalSize < CONFIG.alertThresholds.s3Storage
    };
  } catch (error) {
    logError('Failed to get S3 usage');
    return null;
  }
}

// Get Lambda usage
async function getLambdaUsage() {
  logStep('Checking Lambda usage...');
  
  try {
    const functions = awsCommand('lambda list-functions');
    if (!functions) return null;
    
    let totalInvocations = 0;
    const functionDetails = [];
    
    for (const func of functions.Functions) {
      if (func.FunctionName.includes('brainsait-healthcare')) {
        const metrics = awsCommand(`cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Invocations --dimensions Name=FunctionName,Value=${func.FunctionName} --start-time $(date -u -d '1 month ago' +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 2592000 --statistics Sum`);
        
        const invocations = metrics && metrics.Datapoints.length > 0 ? 
          metrics.Datapoints[0].Sum : 0;
        
        functionDetails.push({
          name: func.FunctionName,
          invocations: invocations,
          memorySize: func.MemorySize,
          timeout: func.Timeout
        });
        
        totalInvocations += invocations;
      }
    }
    
    return {
      totalInvocations: totalInvocations,
      functions: functionDetails,
      threshold: CONFIG.alertThresholds.lambdaInvocations,
      withinLimit: totalInvocations < CONFIG.alertThresholds.lambdaInvocations
    };
  } catch (error) {
    logError('Failed to get Lambda usage');
    return null;
  }
}

// Get DynamoDB usage
async function getDynamoDBUsage() {
  logStep('Checking DynamoDB usage...');
  
  try {
    const tables = awsCommand('dynamodb list-tables');
    if (!tables) return null;
    
    const tableDetails = [];
    
    for (const tableName of tables.TableNames) {
      if (tableName.includes('brainsait-healthcare')) {
        const table = awsCommand(`dynamodb describe-table --table-name ${tableName}`);
        
        if (table) {
          const readCapacity = table.Table.ProvisionedThroughput.ReadCapacityUnits;
          const writeCapacity = table.Table.ProvisionedThroughput.WriteCapacityUnits;
          
          tableDetails.push({
            name: tableName,
            readCapacity: readCapacity,
            writeCapacity: writeCapacity,
            itemCount: table.Table.ItemCount || 0,
            sizeBytes: table.Table.TableSizeBytes || 0
          });
        }
      }
    }
    
    const totalReadCapacity = tableDetails.reduce((sum, table) => sum + table.readCapacity, 0);
    const totalWriteCapacity = tableDetails.reduce((sum, table) => sum + table.writeCapacity, 0);
    
    return {
      totalReadCapacity: totalReadCapacity,
      totalWriteCapacity: totalWriteCapacity,
      tables: tableDetails,
      readThreshold: CONFIG.alertThresholds.dynamodbReads,
      writeThreshold: CONFIG.alertThresholds.dynamodbWrites,
      withinReadLimit: totalReadCapacity <= CONFIG.alertThresholds.dynamodbReads,
      withinWriteLimit: totalWriteCapacity <= CONFIG.alertThresholds.dynamodbWrites
    };
  } catch (error) {
    logError('Failed to get DynamoDB usage');
    return null;
  }
}

// Get CloudFront usage
async function getCloudFrontUsage() {
  logStep('Checking CloudFront usage...');
  
  try {
    const distributions = awsCommand('cloudfront list-distributions');
    if (!distributions) return null;
    
    let totalRequests = 0;
    const distributionDetails = [];
    
    for (const dist of distributions.DistributionList.Items) {
      if (dist.Comment && dist.Comment.includes('BrainSAIT Healthcare')) {
        const metrics = awsCommand(`cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --dimensions Name=DistributionId,Value=${dist.Id} --start-time $(date -u -d '1 month ago' +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) --period 2592000 --statistics Sum --region us-east-1`);
        
        const requests = metrics && metrics.Datapoints.length > 0 ? 
          metrics.Datapoints[0].Sum : 0;
        
        distributionDetails.push({
          id: dist.Id,
          domainName: dist.DomainName,
          requests: requests,
          status: dist.Status
        });
        
        totalRequests += requests;
      }
    }
    
    return {
      totalRequests: totalRequests,
      distributions: distributionDetails,
      threshold: CONFIG.alertThresholds.cloudFrontRequests,
      withinLimit: totalRequests < CONFIG.alertThresholds.cloudFrontRequests
    };
  } catch (error) {
    logError('Failed to get CloudFront usage');
    return null;
  }
}

// Generate cost report
function generateCostReport(usage) {
  const reportPath = path.join(__dirname, '..', 'cost-monitoring-report.md');
  const timestamp = new Date().toISOString();
  
  let report = `# BrainSAIT Healthcare Platform - Cost Monitoring Report

Generated: ${timestamp}
Stack: ${CONFIG.stackName}
Region: ${CONFIG.region}

## 📊 AWS Free Tier Usage Summary

`;

  // S3 Usage
  if (usage.s3) {
    const s3Percentage = ((usage.s3.totalSizeGB / 5) * 100).toFixed(1);
    const s3Status = usage.s3.withinLimit ? '✅' : '⚠️';
    
    report += `### S3 Storage
${s3Status} **${usage.s3.totalSizeGB} GB** used of 5 GB free tier (${s3Percentage}%)

`;
    
    usage.s3.buckets.forEach(bucket => {
      report += `- ${bucket.name}: ${bucket.sizeGB} GB\n`;
    });
    report += '\n';
  }

  // Lambda Usage
  if (usage.lambda) {
    const lambdaPercentage = ((usage.lambda.totalInvocations / 1000000) * 100).toFixed(1);
    const lambdaStatus = usage.lambda.withinLimit ? '✅' : '⚠️';
    
    report += `### Lambda Functions
${lambdaStatus} **${usage.lambda.totalInvocations.toLocaleString()}** invocations of 1M free tier (${lambdaPercentage}%)

`;
    
    usage.lambda.functions.forEach(func => {
      report += `- ${func.name}: ${func.invocations.toLocaleString()} invocations (${func.memorySize}MB, ${func.timeout}s)\n`;
    });
    report += '\n';
  }

  // DynamoDB Usage
  if (usage.dynamodb) {
    const readStatus = usage.dynamodb.withinReadLimit ? '✅' : '⚠️';
    const writeStatus = usage.dynamodb.withinWriteLimit ? '✅' : '⚠️';
    
    report += `### DynamoDB
${readStatus} **${usage.dynamodb.totalReadCapacity}** RCU of 25 free tier
${writeStatus} **${usage.dynamodb.totalWriteCapacity}** WCU of 25 free tier

`;
    
    usage.dynamodb.tables.forEach(table => {
      report += `- ${table.name}: ${table.readCapacity} RCU, ${table.writeCapacity} WCU (${table.itemCount} items, ${(table.sizeBytes / 1024 / 1024).toFixed(2)} MB)\n`;
    });
    report += '\n';
  }

  // CloudFront Usage
  if (usage.cloudfront) {
    const cfPercentage = ((usage.cloudfront.totalRequests / 10000000) * 100).toFixed(1);
    const cfStatus = usage.cloudfront.withinLimit ? '✅' : '⚠️';
    
    report += `### CloudFront
${cfStatus} **${usage.cloudfront.totalRequests.toLocaleString()}** requests of 10M free tier (${cfPercentage}%)

`;
    
    usage.cloudfront.distributions.forEach(dist => {
      report += `- ${dist.domainName}: ${dist.requests.toLocaleString()} requests (${dist.status})\n`;
    });
    report += '\n';
  }

  // Recommendations
  report += `## 🔧 Recommendations

`;

  const alerts = [];
  
  if (usage.s3 && !usage.s3.withinLimit) {
    alerts.push('S3 storage approaching free tier limit');
    report += '- ⚠️ **S3 Storage**: Consider implementing lifecycle policies or cleaning up unused files\n';
  }
  
  if (usage.lambda && !usage.lambda.withinLimit) {
    alerts.push('Lambda invocations approaching free tier limit');
    report += '- ⚠️ **Lambda**: Optimize function performance or implement caching\n';
  }
  
  if (usage.dynamodb && (!usage.dynamodb.withinReadLimit || !usage.dynamodb.withinWriteLimit)) {
    alerts.push('DynamoDB capacity approaching free tier limit');
    report += '- ⚠️ **DynamoDB**: Consider optimizing queries or implementing read replicas\n';
  }
  
  if (usage.cloudfront && !usage.cloudfront.withinLimit) {
    alerts.push('CloudFront requests approaching free tier limit');
    report += '- ⚠️ **CloudFront**: Implement better caching strategies\n';
  }

  if (alerts.length === 0) {
    report += '- ✅ All services are within free tier limits\n';
    report += '- ✅ Continue monitoring usage monthly\n';
    report += '- ✅ Set up billing alerts for early warning\n';
  }

  report += `
## 💰 Estimated Monthly Cost

- **Free Tier Usage**: $0.00
- **Potential Overage**: $${alerts.length * 0.50} - $${alerts.length * 2.00}
- **Total Estimated**: $${alerts.length * 0.50} - $${alerts.length * 2.00}

## 📈 Next Review

Schedule next cost review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

---
*Generated by BrainSAIT Healthcare Platform Cost Monitor*
`;

  fs.writeFileSync(reportPath, report);
  logSuccess(`Cost report generated: ${reportPath}`);
  
  return alerts;
}

// Main monitoring function
async function main() {
  log('🏥 BrainSAIT Healthcare Platform - AWS Cost Monitor', 'cyan');
  log('='.repeat(60), 'cyan');
  
  logInfo('Monitoring AWS free tier usage...');
  
  const usage = {
    s3: await getS3Usage(),
    lambda: await getLambdaUsage(),
    dynamodb: await getDynamoDBUsage(),
    cloudfront: await getCloudFrontUsage()
  };
  
  // Generate report
  const alerts = generateCostReport(usage);
  
  // Summary
  log('\n📊 Usage Summary:', 'cyan');
  
  if (usage.s3) {
    const status = usage.s3.withinLimit ? '✅' : '⚠️';
    log(`${status} S3: ${usage.s3.totalSizeGB} GB / 5 GB`);
  }
  
  if (usage.lambda) {
    const status = usage.lambda.withinLimit ? '✅' : '⚠️';
    log(`${status} Lambda: ${usage.lambda.totalInvocations.toLocaleString()} / 1M invocations`);
  }
  
  if (usage.dynamodb) {
    const readStatus = usage.dynamodb.withinReadLimit ? '✅' : '⚠️';
    const writeStatus = usage.dynamodb.withinWriteLimit ? '✅' : '⚠️';
    log(`${readStatus} DynamoDB Reads: ${usage.dynamodb.totalReadCapacity} / 25 RCU`);
    log(`${writeStatus} DynamoDB Writes: ${usage.dynamodb.totalWriteCapacity} / 25 WCU`);
  }
  
  if (usage.cloudfront) {
    const status = usage.cloudfront.withinLimit ? '✅' : '⚠️';
    log(`${status} CloudFront: ${usage.cloudfront.totalRequests.toLocaleString()} / 10M requests`);
  }
  
  // Alerts
  if (alerts.length > 0) {
    log('\n⚠️  Alerts:', 'yellow');
    alerts.forEach(alert => logWarning(alert));
    log('\n💡 Review the generated report for optimization recommendations.', 'blue');
  } else {
    log('\n🎉 All services are within free tier limits!', 'green');
  }
  
  logSuccess('Cost monitoring completed successfully');
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logError('Cost monitoring failed:');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main, generateCostReport };
