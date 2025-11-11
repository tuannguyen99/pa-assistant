/**
 * Load Test for Target Setting Auto-Save
 * Tests concurrent save operations to ensure data integrity under load
 * 
 * Run with: node tests/load/target-save-load-test.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const NUM_CONCURRENT_USERS = 200;
const NUM_SAVES_PER_USER = 5;

// Sample target data
const generateTargetData = (userId) => ({
  targets: [
    {
      taskDescription: +Test task description for user  - ,
      kpi: +Test KPI for user ,
      weight: 30,
      difficulty: 'L2'
    },
    {
      taskDescription: +Another task for user ,
      kpi: +Another KPI for user ,
      weight: 40,
      difficulty: 'L3'
    },
    {
      taskDescription: +Third task for user ,
      kpi: +Third KPI for user ,
      weight: 30,
      difficulty: 'L1'
    }
  ],
  currentRole: +Test role for user ,
  longTermGoal: +Test goals for user ,
  isDraft: true
});

// Simulate a save request
async function saveDraft(userId, saveNum) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(generateTargetData(userId));
    const url = new URL(+/api/targets);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        // In real scenario, this would be a valid session cookie
        'Cookie': +test-user-
      }
    };

    const protocol = url.protocol === 'https:' ? https : http;
    const startTime = Date.now();

    const req = protocol.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve({
            userId,
            saveNum,
            status: 'success',
            statusCode: res.statusCode,
            duration
          });
        } else {
          resolve({
            userId,
            saveNum,
            status: 'error',
            statusCode: res.statusCode,
            duration,
            error: body
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        userId,
        saveNum,
        status: 'error',
        error: error.message,
        duration: Date.now() - startTime
      });
    });

    req.write(data);
    req.end();
  });
}

// Run load test
async function runLoadTest() {
  console.log(+\n);
  console.log('TARGET SETTING AUTO-SAVE LOAD TEST');
  console.log(+\n);
  console.log(+Testing: );
  console.log(+Concurrent Users: );
  console.log(+Saves per User: );
  console.log(+Total Requests: \n);
  console.log('Starting load test...\n');

  const startTime = Date.now();
  const promises = [];

  // Create concurrent save requests
  for (let userId = 1; userId <= NUM_CONCURRENT_USERS; userId++) {
    for (let saveNum = 1; saveNum <= NUM_SAVES_PER_USER; saveNum++) {
      promises.push(saveDraft(userId, saveNum));
    }
  }

  const results = await Promise.all(promises);
  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  // Analyze results
  const successResults = results.filter(r => r.status === 'success');
  const errorResults = results.filter(r => r.status === 'error');
  const durations = successResults.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);

  // Print results
  console.log(+\n);
  console.log('RESULTS');
  console.log(+\n);
  console.log(+Total Duration: ms);
  console.log(+Requests per Second: );
  console.log(+\nSuccess:  (%));
  console.log(+Errors:  (%));
  console.log(+\nResponse Times:);
  console.log(+  Average: ms);
  console.log(+  Min: ms);
  console.log(+  Max: ms);

  if (errorResults.length > 0) {
    console.log(+\nError Sample (first 5):);
    errorResults.slice(0, 5).forEach(result => {
      console.log(+  User , Save : );
    });
  }

  console.log(+\n\n);

  // Determine test result
  const errorRate = errorResults.length / results.length;
  if (errorRate === 0) {
    console.log(' TEST PASSED: All requests completed successfully!');
    process.exit(0);
  } else if (errorRate < 0.01) {
    console.log(' TEST PASSED WITH WARNINGS: < 1% error rate');
    process.exit(0);
  } else {
    console.log(' TEST FAILED: Error rate too high');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run the test
runLoadTest().catch(error => {
  console.error('Load test failed:', error);
  process.exit(1);
});
