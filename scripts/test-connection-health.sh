#!/bin/bash

# Connection Health Test Script
# Tests database connection and pool health on both local and production

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Database Connection Health Test"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test health endpoint
test_health_endpoint() {
  local url=$1
  local env_name=$2

  echo "Testing $env_name environment..."
  echo "URL: $url"
  echo ""

  # Make request
  response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  # Check HTTP status
  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ HTTP 200 OK${NC}"
  else
    echo -e "${RED}✗ HTTP $http_code${NC}"
    echo "$body"
    return 1
  fi

  # Parse JSON (if jq is available)
  if command -v jq &> /dev/null; then
    status=$(echo "$body" | jq -r '.status')
    connected=$(echo "$body" | jq -r '.database.connected')
    latency=$(echo "$body" | jq -r '.database.latency_ms')

    echo -e "${GREEN}✓ Status: $status${NC}"
    echo -e "${GREEN}✓ Connected: $connected${NC}"
    echo -e "${GREEN}✓ Latency: ${latency}ms${NC}"

    # Check if connection pool metrics are available
    if echo "$body" | jq -e '.connection_pool' > /dev/null 2>&1; then
      total=$(echo "$body" | jq -r '.connection_pool.total_connections')
      active=$(echo "$body" | jq -r '.connection_pool.active_connections')
      idle=$(echo "$body" | jq -r '.connection_pool.idle_connections')
      max=$(echo "$body" | jq -r '.connection_pool.max_connections')
      usage=$(echo "$body" | jq -r '.connection_pool.usage_percentage')

      echo ""
      echo "Connection Pool Metrics:"
      echo "  Total: $total / $max"
      echo "  Active: $active"
      echo "  Idle: $idle"
      echo "  Usage: ${usage}%"

      # Color-code usage percentage
      usage_int=${usage%.*}
      if [ "$usage_int" -lt 50 ]; then
        echo -e "  ${GREEN}✓ Healthy (< 50%)${NC}"
      elif [ "$usage_int" -lt 75 ]; then
        echo -e "  ${YELLOW}⚠ Moderate (50-75%)${NC}"
      elif [ "$usage_int" -lt 90 ]; then
        echo -e "  ${YELLOW}⚠ Warning (75-90%)${NC}"
      else
        echo -e "  ${RED}✗ Critical (> 90%)${NC}"
      fi
    fi

    # Check for warnings
    if echo "$body" | jq -e '.warnings' > /dev/null 2>&1; then
      warnings=$(echo "$body" | jq -r '.warnings[]')
      if [ -n "$warnings" ]; then
        echo ""
        echo -e "${YELLOW}⚠ Warnings:${NC}"
        echo "$warnings" | while read -r warning; do
          echo "  - $warning"
        done
      fi
    fi

    # Check for recommendations
    if echo "$body" | jq -e '.recommendations' > /dev/null 2>&1; then
      recommendations=$(echo "$body" | jq -r '.recommendations[]')
      if [ -n "$recommendations" ]; then
        echo ""
        echo -e "${YELLOW}💡 Recommendations:${NC}"
        echo "$recommendations" | while read -r rec; do
          echo "  - $rec"
        done
      fi
    fi
  else
    # If jq not available, just show raw response
    echo "$body"
    echo ""
    echo -e "${YELLOW}⚠ Install 'jq' for better output formatting${NC}"
  fi

  echo ""
}

# Test Development (if localhost is running)
echo "══════════════════════════════════════════════════════════════"
echo "1. Development Environment"
echo "══════════════════════════════════════════════════════════════"
echo ""

if curl -s --connect-timeout 3 "http://localhost:3000/api/health/database" > /dev/null 2>&1; then
  test_health_endpoint "http://localhost:3000/api/health/database" "Development (localhost:3000)"
else
  echo -e "${YELLOW}⚠ Localhost:3000 not running - skipping development test${NC}"
  echo "  To test development: npm run dev"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "2. Production Environment"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Test Production
test_health_endpoint "https://mobile.openplp.com/api/health/database" "Production"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "3. Database Connection Test (Direct)"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Test direct database connection
if command -v psql &> /dev/null; then
  echo "Testing direct PostgreSQL connection..."
  PGPASSWORD='P@ssw0rd' psql -h 157.10.73.52 -U admin -d plp_contract_agreement -c "SELECT version();" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Direct database connection successful${NC}"
  else
    echo -e "${RED}✗ Direct database connection failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠ psql not installed - skipping direct connection test${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "4. Connection Pattern Check"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Run connection pattern checker
if [ -f "scripts/check-connection-patterns.js" ]; then
  node scripts/check-connection-patterns.js
else
  echo -e "${YELLOW}⚠ Connection pattern checker not found${NC}"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Test Summary"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "All tests completed. Review results above."
echo ""
echo "Next steps:"
echo "  - If all tests passed: Deploy to production"
echo "  - If warnings found: Review and optimize"
echo "  - If errors found: Check documentation"
echo ""
echo "Documentation:"
echo "  - Full guide: docs/DATABASE_CONNECTION_POOLING.md"
echo "  - Quick ref: docs/CONNECTION_POOLING_QUICK_REFERENCE.md"
echo ""
