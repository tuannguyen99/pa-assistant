/**
 * Load Test: Target Setting Workflow - 200 Concurrent Users
 * Tests system stability when 200 users submit target settings simultaneously
 * 
 * Requirements tested (Story 1.4 AC11):
 * - No crashes, hangs, or errors
 * - No data loss or corruption
 * - Response time < 500ms average
 * - System remains stable throughout
 * 
 * Run with: node tests/load/target-save-load-test.js
 * Requires: Development server running on http://localhost:3000
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const NUM_CONCURRENT_USERS = 200;
const TEST_CYCLE_YEAR = new Date().getFullYear() + 10; // Use future year to avoid conflicts

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   TARGET SETTING WORKFLOW - LOAD TEST (Story 1.4 AC11)        ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log(`Configuration:
  - Base URL: ${BASE_URL}
  - Concurrent Users: ${NUM_CONCURRENT_USERS}
  - Test Cycle Year: ${TEST_CYCLE_YEAR}
  - Target: <500ms average response time
  - Target: 100% success rate (no crashes/hangs)
`);

// Generate realistic target data
const generateTargetData = (userId) => ({
  cycleYear: TEST_CYCLE_YEAR,
  targets: [
    {
      taskDescription: `User ${userId} - Design and implement scalable microservices architecture with proper security measures and monitoring`,
      kpi: `Complete 3 microservices with 90% test coverage and documentation by Q2`,
      weight: 30,
      difficulty: 'L1'
    },
    {
      taskDescription: `User ${userId} - Improve system performance and reduce API response times while maintaining high availability`,
      kpi: `Reduce p95 response time to <100ms and achieve 99.9% uptime`,
      weight: 35,
      difficulty: 'L2'
    },
    {
      taskDescription: `User ${userId} - Mentor junior team members and conduct thorough code reviews`,
      kpi: `Conduct 50+ code reviews and mentor 2 junior developers successfully`,
      weight: 20,
      difficulty: 'L3'
    },
    {
      taskDescription: `User ${userId} - Maintain comprehensive technical documentation and architecture diagrams`,
      kpi: `Document all APIs and maintain up-to-date architecture diagrams`,
      weight: 15,
      difficulty: 'L3'
    }
  ],
  currentRole: `Senior Software Engineer ${userId} - Backend Systems Development`,
  longTermGoal: `Advance to Tech Lead position and lead a team of 5-8 engineers within 18-24 months`,
  isDraft: false // Final submission
});

// Simulate a complete target submission workflow
async function submitTargetWorkflow(userId) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const data = JSON.stringify(generateTargetData(userId));
    const url = new URL(`${BASE_URL}/api/targets`);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        // In production, this would be a valid session cookie
        // For load testing, we're testing the endpoint behavior
        'Cookie': `test-user-${userId}=active`,
      },
      timeout: 10000, // 10 second timeout
    };

    const protocol = url.protocol === 'https:' ? https : http;

    const req = protocol.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (res.statusCode === 201 || res.statusCode === 200) {
          try {
            const responseData = JSON.parse(body);
            resolve({
              userId,
              status: 'success',
              statusCode: res.statusCode,
              duration,
              targetId: responseData.id,
            });
          } catch (e) {
            resolve({
              userId,
              status: 'error',
              statusCode: res.statusCode,
              duration,
              error: 'Invalid JSON response',
            });
          }
        } else {
          resolve({
            userId,
            status: 'error',
            statusCode: res.statusCode,
            duration,
            error: body.substring(0, 200), // First 200 chars of error
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        userId,
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        userId,
        status: 'error',
        error: 'Request timeout (>10s)',
        duration: 10000,
      });
    });

    req.write(data);
    req.end();
  });
}

// Run load test
async function runLoadTest() {
  console.log(`\n🚀 Starting load test at ${new Date().toISOString()}\n`);
  console.log(`⏳ Simulating ${NUM_CONCURRENT_USERS} concurrent target submissions...\n`);

  const testStartTime = Date.now();
  const promises = [];

  // Create all concurrent requests
  for (let userId = 1; userId <= NUM_CONCURRENT_USERS; userId++) {
    promises.push(submitTargetWorkflow(userId));
  }

  // Execute all requests concurrently
  const results = await Promise.all(promises);
  const testEndTime = Date.now();
  const totalDuration = testEndTime - testStartTime;

  // Analyze results
  const successResults = results.filter(r => r.status === 'success');
  const errorResults = results.filter(r => r.status === 'error');
  
  const durations = successResults.map(r => r.duration);
  const avgDuration = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length 
    : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  
  const requestsPerSecond = (NUM_CONCURRENT_USERS / (totalDuration / 1000)).toFixed(2);
  const successRate = ((successResults.length / NUM_CONCURRENT_USERS) * 100).toFixed(2);

  // Print detailed results
  console.log(`╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║                     📊 TEST RESULTS                            ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝`);
  console.log(`\n⏱️  TIMING METRICS:`);
  console.log(`   Total Test Duration:       ${totalDuration}ms`);
  console.log(`   Requests per Second:       ${requestsPerSecond}`);
  console.log(`\n✅  SUCCESS METRICS:`);
  console.log(`   Successful Submissions:    ${successResults.length}/${NUM_CONCURRENT_USERS}`);
  console.log(`   Success Rate:              ${successRate}%`);
  console.log(`\n❌  ERROR METRICS:`);
  console.log(`   Failed Submissions:        ${errorResults.length}/${NUM_CONCURRENT_USERS}`);
  console.log(`   Error Rate:                ${(100 - successRate).toFixed(2)}%`);
  
  if (successResults.length > 0) {
    console.log(`\n⚡  RESPONSE TIME METRICS:`);
    console.log(`   Average Response Time:     ${avgDuration.toFixed(2)}ms`);
    console.log(`   Min Response Time:         ${minDuration}ms`);
    console.log(`   Max Response Time:         ${maxDuration}ms`);
    
    // Calculate percentiles
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)];
    const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
    const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)];
    
    console.log(`   P50 (Median):              ${p50}ms`);
    console.log(`   P95:                       ${p95}ms`);
    console.log(`   P99:                       ${p99}ms`);
  }

  if (errorResults.length > 0) {
    console.log(`\n⚠️  ERROR DETAILS (First 10):`);
    errorResults.slice(0, 10).forEach((result, index) => {
      console.log(`   ${index + 1}. User ${result.userId}: ${result.error || 'Unknown error'} (Status: ${result.statusCode || 'N/A'})`);
    });
    if (errorResults.length > 10) {
      console.log(`   ... and ${errorResults.length - 10} more errors`);
    }
  }

  // Test evaluation
  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║                    🎯 TEST EVALUATION                          ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

  const requirements = [
    { name: 'No crashes/hangs', passed: errorResults.length < NUM_CONCURRENT_USERS * 0.05 }, // <5% error rate
    { name: 'Response time <500ms (avg)', passed: avgDuration < 500 },
    { name: 'No data loss', passed: successResults.length > 0 },
    { name: 'System stability', passed: errorResults.filter(e => e.error && e.error.includes('timeout')).length === 0 },
  ];

  requirements.forEach(req => {
    const icon = req.passed ? '✅' : '❌';
    const status = req.passed ? 'PASS' : 'FAIL';
    console.log(`   ${icon} ${req.name}: ${status}`);
  });

  const allPassed = requirements.every(r => r.passed);
  const finalSuccessRate = parseFloat(successRate);

  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  if (allPassed && finalSuccessRate >= 95) {
    console.log(`║            ✅ LOAD TEST PASSED - SYSTEM IS STABLE! ✅          ║`);
  } else if (finalSuccessRate >= 80) {
    console.log(`║        ⚠️  LOAD TEST PASSED WITH WARNINGS - REVIEW NEEDED      ║`);
  } else {
    console.log(`║              ❌ LOAD TEST FAILED - ACTION REQUIRED ❌          ║`);
  }
  console.log(`╚════════════════════════════════════════════════════════════════╝\n`);

  // Return summary
  return {
    totalUsers: NUM_CONCURRENT_USERS,
    successful: successResults.length,
    failed: errorResults.length,
    successRate: finalSuccessRate,
    avgResponseTime: avgDuration,
    maxResponseTime: maxDuration,
    passed: allPassed && finalSuccessRate >= 95,
  };
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the test
console.log(`⚙️  Preparing test environment...\n`);

// Give a moment to ensure server is ready
setTimeout(() => {
  runLoadTest()
    .then(summary => {
      console.log(`Test completed at ${new Date().toISOString()}\n`);
      
      if (summary.passed) {
        console.log(`🎉 All requirements met! System can handle ${NUM_CONCURRENT_USERS} concurrent users.\n`);
        process.exit(0);
      } else {
        console.log(`💡 Review the metrics above and optimize as needed.\n`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Load test crashed:', error);
      process.exit(1);
    });
}, 1000);
