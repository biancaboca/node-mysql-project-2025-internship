$ErrorActionPreference = 'Stop'

# Configurare
$baseUrl = "http://localhost:3000/api/users"
$adminEmail = "admin@example.com"
$adminPassword = "admin123"
$clientEmail = "client@example.com"
$clientPassword = "client123"

Write-Host "=== Testare API Utilizatori ===" -ForegroundColor Yellow

# Obține token admin
Write-Host "`nObțin token admin..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -ContentType "application/json" -Body (@{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json)
    $adminToken = $adminResponse.token
    Write-Host "Token admin obținut cu succes!" -ForegroundColor Green
} catch {
    Write-Host "Nu s-a putut obține token admin. Verifică credențialele." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# Obține token client
Write-Host "`nObțin token client..." -ForegroundColor Yellow
try {
    $clientResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -ContentType "application/json" -Body (@{
        email = $clientEmail
        password = $clientPassword
    } | ConvertTo-Json)
    $clientToken = $clientResponse.token
    Write-Host "Token client obținut cu succes!" -ForegroundColor Green
} catch {
    Write-Host "Nu s-a putut obține token client. Verifică credențialele." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

# 1. Test înregistrare client (public)
Write-Host "`n1. Test înregistrare client (public)" -ForegroundColor Yellow
try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -ContentType "application/json" -Body (@{
        email = "nou_client@example.com"
        password = "parola123"
        firstName = "Client"
        lastName = "Nou"
        role = "client"
    } | ConvertTo-Json)
    Write-Host "Înregistrare client reușită!" -ForegroundColor Green
} catch {
    Write-Host "Înregistrare client eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2. Test creare admin
Write-Host "`n2. Test creare admin" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $createAdminResponse = Invoke-RestMethod -Uri "$baseUrl/admin" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        email = "nou_admin@example.com"
        password = "parola123"
        firstName = "Admin"
        lastName = "Nou"
    } | ConvertTo-Json)
    Write-Host "Creare admin reușită!" -ForegroundColor Green
} catch {
    Write-Host "Creare admin eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 3. Test creare angajat
Write-Host "`n3. Test creare angajat" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $createEmployeeResponse = Invoke-RestMethod -Uri "$baseUrl/employee" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        email = "nou_angajat@example.com"
        password = "parola123"
        firstName = "Angajat"
        lastName = "Nou"
        department = "Medical"
    } | ConvertTo-Json)
    Write-Host "Creare angajat reușită!" -ForegroundColor Green
} catch {
    Write-Host "Creare angajat eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 4. Test creare client (de către personal)
Write-Host "`n4. Test creare client (de către personal)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $createClientResponse = Invoke-RestMethod -Uri "$baseUrl/client" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        email = "client_creat@example.com"
        password = "parola123"
        firstName = "Client"
        lastName = "Creat"
    } | ConvertTo-Json)
    Write-Host "Creare client de către personal reușită!" -ForegroundColor Green
} catch {
    Write-Host "Creare client de către personal eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 5. Test obținere profil propriu
Write-Host "`n5. Test obținere profil propriu" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $clientToken"
    }
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Get -Headers $headers
    Write-Host "Obținere profil propriu reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere profil propriu eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 6. Test actualizare profil propriu
Write-Host "`n6. Test actualizare profil propriu" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $clientToken"
    }
    $updateProfileResponse = Invoke-RestMethod -Uri "$baseUrl/profile" -Method Put -ContentType "application/json" -Headers $headers -Body (@{
        phone = "0799999999"
    } | ConvertTo-Json)
    Write-Host "Actualizare profil propriu reușită!" -ForegroundColor Green
} catch {
    Write-Host "Actualizare profil propriu eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 7. Test obținere toți utilizatorii
Write-Host "`n7. Test obținere toți utilizatorii" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $allUsersResponse = Invoke-RestMethod -Uri "$baseUrl" -Method Get -Headers $headers
    Write-Host "Obținere toți utilizatorii reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere toți utilizatorii eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 8. Test obținere utilizatori după rol
Write-Host "`n8. Test obținere utilizatori după rol" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $usersByRoleResponse = Invoke-RestMethod -Uri "$baseUrl/role/client" -Method Get -Headers $headers
    Write-Host "Obținere utilizatori după rol reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere utilizatori după rol eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 9. Test obținere toți adminii
Write-Host "`n9. Test obținere toți adminii" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $allAdminsResponse = Invoke-RestMethod -Uri "$baseUrl/admins/all" -Method Get -Headers $headers
    Write-Host "Obținere toți adminii reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere toți adminii eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Raport final
Write-Host "`n=== Raport final ===" -ForegroundColor Yellow
Write-Host "Teste finalizate. Verifică rezultatele de mai sus pentru detalii." -ForegroundColor Green
