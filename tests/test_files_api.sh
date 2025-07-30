#!/bin/bash
# File API Test Script
# This script runs the files migration and tests basic file API endpoints

# Change to the project directory
cd "$(dirname "$0")/.."

# Run the files table migration
echo -e "\033[36mRunning migration to create files table...\033[0m"
node migrate.js run

# Start server in the background
echo -e "\033[36mStarting server in the background...\033[0m"
node app.js > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo -e "\033[36mWaiting for server to start...\033[0m"
sleep 5

# Create a test file
TEST_FILE="/tmp/test-upload.txt"
echo "This is a test file for upload API testing." > "$TEST_FILE"

# Login to get token
echo -e "\033[36mLogging in to get JWT token...\033[0m"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"admin@dentalclinic.com","password":"password123"}' http://localhost:3000/api/users/login)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "\033[31mFailed to get authentication token. Exiting.\033[0m"
    if [ ! -z "$SERVER_PID" ]; then kill $SERVER_PID; fi
    exit 1
fi

echo -e "\033[32mSuccessfully obtained JWT token\033[0m"

# Upload a test file
echo -e "\033[36mUploading test file...\033[0m"
UPLOAD_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -F "file=@$TEST_FILE" http://localhost:3000/api/files/upload)

if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
    echo -e "\033[32mFile uploaded successfully!\033[0m"
    echo -e "\033[36mFile info:\033[0m"
    echo "$UPLOAD_RESPONSE" | grep -o '"file":{[^}]*}' | sed 's/"file"://'
    FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
else
    echo -e "\033[31mFile upload failed\033[0m"
    echo "$UPLOAD_RESPONSE"
fi

# Get list of files
echo -e "\033[36mGetting list of files...\033[0m"
FILES_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/files)

if echo "$FILES_RESPONSE" | grep -q '"success":true'; then
    echo -e "\033[32mFiles retrieved successfully!\033[0m"
    FILES_COUNT=$(echo "$FILES_RESPONSE" | grep -o '"files":\[[^]]*\]' | grep -o 'originalname' | wc -l)
    echo -e "\033[36mFiles count: $FILES_COUNT\033[0m"
    echo "$FILES_RESPONSE" | grep -o '"files":\[[^]]*\]'
fi

# Clean up - delete file if we have ID
if [ ! -z "$FILE_ID" ]; then
    echo -e "\033[36mDeleting test file with ID $FILE_ID...\033[0m"
    DELETE_RESPONSE=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/files/$FILE_ID)
    
    if echo "$DELETE_RESPONSE" | grep -q '"success":true'; then
        echo -e "\033[32mFile deleted successfully!\033[0m"
    else
        echo -e "\033[31mFile deletion failed\033[0m"
        echo "$DELETE_RESPONSE"
    fi
fi

# Clean up
if [ -f "$TEST_FILE" ]; then
    rm "$TEST_FILE"
fi

# Stop the server
if [ ! -z "$SERVER_PID" ]; then
    echo -e "\033[36mStopping server...\033[0m"
    kill $SERVER_PID
fi

echo -e "\033[32mFile API test complete!\033[0m"
