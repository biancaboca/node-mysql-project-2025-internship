#!/bin/bash

# Login as admin
echo "Testing Admin Login..."
curl -X POST http://localhost:3000/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}' \
  -o login_response.json

# Extract token from response
TOKEN=$(node -e "console.log(require('./login_response.json').token)")

echo "\nTesting Protected Route with Token..."
# Test protected route
curl -X GET http://localhost:3000/api/admins \
  -H "Authorization: Bearer $TOKEN"

# Clean up
rm login_response.json
