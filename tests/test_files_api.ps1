# File API Test Script
# This script runs the files migration and tests basic file API endpoints

# Change to the project directory
cd $PSScriptRoot\..

# Run the files table migration
Write-Host "Running migration to create files table..." -ForegroundColor Cyan
node migrate.js run

# Start server in the background
$serverProcess = Start-Process node -ArgumentList "app.js" -PassThru -WindowStyle Hidden

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Create a test file
$testFile = "$env:TEMP\test-upload.txt"
Set-Content -Path $testFile -Value "This is a test file for upload API testing."

# Login to get token
Write-Host "Logging in to get JWT token..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/users/login" -Body '{"email":"admin@dentalclinic.com","password":"password123"}' -ContentType "application/json"
$token = $loginResponse.token

if (-not $token) {
    Write-Host "Failed to get authentication token. Exiting." -ForegroundColor Red
    if ($serverProcess) { Stop-Process -Id $serverProcess.Id }
    exit 1
}

Write-Host "Successfully obtained JWT token" -ForegroundColor Green

# Upload a test file
Write-Host "Uploading test file..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
}

$fileContent = Get-Content $testFile -Raw
$fileBytes = [System.Text.Encoding]::UTF8.GetBytes($fileContent)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"test-upload.txt`"",
    "Content-Type: text/plain$LF",
    $fileContent,
    "--$boundary--$LF"
) -join $LF

try {
    $uploadResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/files/upload" -Method Post -Headers $headers -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
    if ($uploadResponse.success) {
        Write-Host "File uploaded successfully!" -ForegroundColor Green
        Write-Host "File info: " -ForegroundColor Cyan
        $uploadResponse.file | Format-List
        $fileId = $uploadResponse.file.id
    } else {
        Write-Host "File upload failed" -ForegroundColor Red
        $uploadResponse
    }

    # Get list of files
    Write-Host "Getting list of files..." -ForegroundColor Cyan
    $filesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/files" -Method Get -Headers $headers
    
    if ($filesResponse.success) {
        Write-Host "Files retrieved successfully!" -ForegroundColor Green
        Write-Host "Files count: $($filesResponse.files.Count)" -ForegroundColor Cyan
        $filesResponse.files | Format-Table id, originalname, mimetype, size, created_at
    }

    # Clean up - delete file if we have ID
    if ($fileId) {
        Write-Host "Deleting test file with ID $fileId..." -ForegroundColor Cyan
        $deleteResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/files/$fileId" -Method Delete -Headers $headers
        
        if ($deleteResponse.success) {
            Write-Host "File deleted successfully!" -ForegroundColor Green
        } else {
            Write-Host "File deletion failed" -ForegroundColor Red
        }
    }

}
catch {
    Write-Host "Error testing file API: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode.value__
    Write-Host $_.Exception.Response.StatusDescription
}

# Clean up
if (Test-Path $testFile) {
    Remove-Item $testFile
}

# Stop the server
if ($serverProcess) {
    Write-Host "Stopping server..." -ForegroundColor Cyan
    Stop-Process -Id $serverProcess.Id
}

Write-Host "File API test complete!" -ForegroundColor Green
