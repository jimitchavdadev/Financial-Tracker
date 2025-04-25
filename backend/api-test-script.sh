#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3001"

# Supabase configuration
SUPABASE_URL="https://your-supabase-project-id.supabase.co"
SUPABASE_KEY="your-supabase-anon-key"

# Function to make a request and format the response
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -e "\n${YELLOW}======================================================${NC}"
  echo -e "${BLUE}${description}${NC}"
  echo -e "${YELLOW}======================================================${NC}"
  echo -e "${GREEN}REQUEST:${NC} ${method} ${endpoint}"
  
  if [ ! -z "$data" ]; then
    echo -e "${GREEN}DATA:${NC} ${data}"
  fi
  
  # Making the request
  if [ "$method" == "GET" ]; then
    response=$(curl -s -X GET "${API_URL}${endpoint}" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_KEY}" \
      -H "X-Supabase-URL: ${SUPABASE_URL}" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -X ${method} "${API_URL}${endpoint}" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_KEY}" \
      -H "X-Supabase-URL: ${SUPABASE_URL}" \
      -H "Content-Type: application/json" \
      -d "${data}")
  fi
  
  # Check if the response is valid JSON
  if echo "$response" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}RESPONSE:${NC}"
    echo "$response" | jq .
  else
    echo -e "${RED}Error: Invalid JSON response${NC}"
    echo "$response"
  fi
  
  # Store response to use in subsequent requests
  echo "$response" > /tmp/last_response.json
}

# Function to extract an ID from the last response
get_id_from_response() {
  local id_field=$1
  jq -r ".$id_field" /tmp/last_response.json
}

# Test CATEGORIES endpoints
make_request "GET" "/categories" "" "Getting all categories"

# Test EXPENSES endpoints
make_request "GET" "/expenses" "" "Getting all expenses"

# Create a new expense
expense_data='{"date":"2025-04-13","description":"Test Expense","category":"Groceries","amount":45.99}'
make_request "POST" "/expenses" "$expense_data" "Creating a new expense"

# Get the ID from the response for later use
expense_id=$(get_id_from_response "id")

# Update the expense we just created
update_expense_data='{"date":"2025-04-13","description":"Updated Test Expense","category":"Groceries","amount":50.99}'
make_request "PUT" "/expenses/$expense_id" "$update_expense_data" "Updating expense $expense_id"

# Test filtering expenses
make_request "GET" "/expenses?startDate=2025-01-01&endDate=2025-04-13&category=Groceries&search=Test" "" "Getting filtered expenses"

# Test GOALS endpoints
make_request "GET" "/goals" "" "Getting all goals"

# Create a new goal
goal_data='{"name":"Emergency Fund","targetAmount":5000,"currentAmount":1000,"targetDate":"2025-12-31"}'
make_request "POST" "/goals" "$goal_data" "Creating a new goal"

# Get the ID from the response for later use
goal_id=$(get_id_from_response "id")

# Update the goal we just created
update_goal_data='{"name":"Emergency Fund","targetAmount":6000,"currentAmount":1200,"targetDate":"2025-12-31"}'
make_request "PUT" "/goals/$goal_id" "$update_goal_data" "Updating goal $goal_id"

# Contribute to a goal
contribute_data='{"amount":500}'
make_request "POST" "/goals/$goal_id/contribute" "$contribute_data" "Contributing to goal $goal_id"

# Test INVESTMENTS endpoints
make_request "GET" "/investments" "" "Getting all investments"

# Create a new investment
investment_data='{"name":"Tech Stock","ticker":"TECH","quantity":10,"purchasePrice":150.00,"currentPrice":155.25,"purchaseDate":"2025-03-01"}'
make_request "POST" "/investments" "$investment_data" "Creating a new investment"

# Get the ID from the response for later use
investment_id=$(get_id_from_response "id")

# Update the investment we just created
update_investment_data='{"name":"Tech Stock","ticker":"TECH","quantity":15,"purchasePrice":150.00,"currentPrice":155.25,"purchaseDate":"2025-03-01"}'
make_request "PUT" "/investments/$investment_id" "$update_investment_data" "Updating investment $investment_id"

# Get investment history
make_request "GET" "/investments/history" "" "Getting investment history"

# Refresh investment prices
make_request "POST" "/investments/refresh" "{}" "Refreshing investment prices"

# Run a cleanup if the CLEANUP flag is set
if [ "$1" == "cleanup" ]; then
  echo -e "\n${YELLOW}======================================================${NC}"
  echo -e "${RED}Cleaning up created resources${NC}"
  echo -e "${YELLOW}======================================================${NC}"
  
  # Delete the investment
  make_request "DELETE" "/investments/$investment_id" "" "Deleting investment $investment_id"
  
  # Delete the goal
  make_request "DELETE" "/goals/$goal_id" "" "Deleting goal $goal_id"
  
  # Delete the expense
  make_request "DELETE" "/expenses/$expense_id" "" "Deleting expense $expense_id"
fi

echo -e "\n${GREEN}API tests completed!${NC}"