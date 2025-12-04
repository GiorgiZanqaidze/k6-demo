# k6 Load Testing Roadmap: The Black Friday Crash

## Overview

This roadmap guides you through building a deliberately flawed API and using k6 to identify its breaking point. You'll learn how code bottlenecks manifest in load testing metrics and how to set up proper thresholds for production monitoring.

---

## Step 1: Project Setup and Express Server Foundation

**Goal**: Establish the project structure and understand the API endpoints we'll be testing.

**What you'll learn**: 
- Why we need a controlled environment for load testing
- The difference between fast, slow, and flaky endpoints

**Actions**:
- Initialize npm project (`npm init -y`)
- Install Express.js (`npm install express`)
- Create `server.js` with three endpoints:
  - `/products` - Fast static endpoint (baseline)
  - `/product/:id` - Simulated database read with 200ms delay
  - `/checkout` - The bottleneck endpoint with intentional flaws

**Key Concepts**:
- **Baseline endpoint**: Establishes what "normal" performance looks like
- **Simulated delay**: Mimics real-world database latency
- **Stateful endpoint**: The checkout route maintains order count, creating a shared bottleneck

**Success Criteria**: Server runs on port 3000 and all endpoints respond correctly under normal load.

---

## Step 2: Implement the Intentional Bottleneck

**Goal**: Add the buggy logic that will cause the server to fail under load.

**What you'll learn**:
- How shared state can create bottlenecks
- Why increasing latency is often worse than immediate failures
- The importance of graceful degradation

**Actions**:
- Implement order count tracking in `/checkout`
- Add conditional delay logic (50ms → 2000ms when orderCount > 50)
- Add failure condition (503 error when orderCount > 100)
- Implement automatic reset mechanism (every 30 seconds)

**Key Concepts**:
- **Cascading failure**: Small delays compound under concurrent load
- **Service degradation**: The endpoint doesn't crash immediately but becomes unusable
- **Load simulation**: The reset mechanism allows repeated testing cycles

**Success Criteria**: Server responds normally to single requests but shows degraded performance when hit rapidly.

---

## Step 3: Build the k6 Load Test Script

**Goal**: Create a realistic user journey that will stress-test the API and identify the breaking point.

**What you'll learn**:
- User journey modeling vs. single-endpoint testing
- k6 stages and ramp-up patterns
- Setting meaningful thresholds for production monitoring
- Using groups to organize and analyze different types of requests

**Actions**:
- Create `load-test.js` with k6 configuration
- Define ramp-up stages (10 → 50 → 100 VUs)
- Set thresholds for error rate and latency
- Implement three user journey groups:
  1. Browse Products (fast GET)
  2. View Product Details (slower GET with latency check)
  3. Checkout (POST that triggers bottleneck)
- Add realistic sleep delays between actions

**Key Concepts**:
- **Virtual Users (VUs)**: Simulate concurrent real users
- **Stages**: Gradual ramp-up prevents false positives and shows degradation curve
- **Thresholds**: Define acceptable performance limits (fail fast in CI/CD)
- **Groups**: Separate metrics by functionality (read vs. write operations)

**Success Criteria**: k6 script runs without syntax errors and generates metrics output.

---

## Step 4: Execute Load Test and Analyze Results

**Goal**: Run the load test, observe the failure, and understand what the metrics tell you.

**What you'll learn**:
- How to interpret k6 output and identify bottlenecks
- Correlation between code logic and performance metrics
- The difference between p50, p95, and p99 latency percentiles
- How error rates and latency thresholds work together

**Actions**:
- Start the Express server (`node server.js`)
- Run k6 load test (`k6 run load-test.js`)
- Observe metrics during each stage:
  - Early stage (10 VUs): Normal performance, all thresholds pass
  - Middle stage (50 VUs): Checkout latency spikes, p95 threshold fails
  - Late stage (100 VUs): 503 errors appear, error rate threshold fails
- Document the breaking point (approximately 50-100 VUs)

**Key Concepts**:
- **Percentiles**: p95 means 95% of requests were faster than this value
- **Threshold failures**: Red indicators show when performance degrades
- **Breaking point**: The VU count where the system becomes unreliable
- **Error patterns**: 503 errors indicate the server is overwhelmed, not crashed

**Success Criteria**: Identify which endpoint fails, at what VU count, and which thresholds are violated.

---

## Step 5: Fix the Bottleneck and Verify Improvement

**Goal**: Remove the artificial bottleneck and prove that the fix works using the same load test.

**What you'll learn**:
- How to validate fixes with load testing
- The importance of regression testing under load
- Why the same test should pass after fixes

**Actions**:
- Remove the conditional delay logic from `/checkout` endpoint
- Remove the orderCount-based failure condition
- Keep the automatic reset (or remove if desired)
- Rerun the same k6 load test
- Compare results: all thresholds should now pass even at 100 VUs

**Key Concepts**:
- **Before/After comparison**: Same test, different results prove the fix
- **Regression testing**: Load tests should be part of your test suite
- **Performance validation**: Metrics provide objective proof of improvement

**Success Criteria**: All k6 thresholds pass (green) at 100 VUs, proving the bottleneck is resolved.

---

## Next Steps (Optional)

- Add more realistic endpoints (authentication, inventory checks)
- Experiment with different ramp-up patterns
- Integrate k6 into CI/CD pipeline
- Add custom metrics and custom thresholds
- Test with different payload sizes and request patterns

