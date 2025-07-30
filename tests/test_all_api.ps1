$ErrorActionPreference = 'Stop'

# Configurare
$baseUrl = "http://localhost:3000/api"
$adminEmail = "admin@example.com"
$adminPassword = "admin123"
$clientEmail = "client@example.com"
$clientPassword = "client123"
$employeeEmail = "employee@example.com"
$employeePassword = "employee123"

Write-Host "=== Testare API Clinica Dentară ===" -ForegroundColor Yellow

# Obține token admin
Write-Host "`nObțin token admin..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -ContentType "application/json" -Body (@{
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
    $clientResponse = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -ContentType "application/json" -Body (@{
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

# Obține token angajat
Write-Host "`nObțin token angajat..." -ForegroundColor Yellow
try {
    $employeeResponse = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -ContentType "application/json" -Body (@{
        email = $employeeEmail
        password = $employeePassword
    } | ConvertTo-Json)
    $employeeToken = $employeeResponse.token
    Write-Host "Token angajat obținut cu succes!" -ForegroundColor Green
} catch {
    Write-Host "Nu s-a putut obține token angajat. Folosesc token-ul de admin ca înlocuitor." -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    $employeeToken = $adminToken
}

#---------------------------
# 1. TESTE API PROGRAMĂRI
#---------------------------
Write-Host "`n=== 1. TESTE API PROGRAMĂRI ===" -ForegroundColor Cyan

# 1.1 Creare programare
Write-Host "`n1.1. Test creare programare" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $createAppointmentResponse = Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        clientId = 3
        employeeId = 2
        appointmentDate = "2025-08-15T14:00:00"
        duration = 60
        notes = "Consult stomatologic general"
        status = "scheduled"
    } | ConvertTo-Json)
    Write-Host "Creare programare reușită!" -ForegroundColor Green
    $appointmentId = $createAppointmentResponse.appointmentId
    if (-not $appointmentId) {
        $appointmentId = 1
        Write-Host "Nu s-a putut extrage ID-ul programării. Se folosește ID implicit: 1" -ForegroundColor Yellow
    } else {
        Write-Host "ID Programare: $appointmentId"
    }
} catch {
    Write-Host "Creare programare eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    $appointmentId = 1
    Write-Host "Se folosește ID implicit pentru programare: 1" -ForegroundColor Yellow
}

# 1.2 Obținere toate programările
Write-Host "`n1.2. Test obținere toate programările" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $getAllAppointmentsResponse = Invoke-RestMethod -Uri "$baseUrl/appointments" -Method Get -Headers $headers
    Write-Host "Obținere toate programările reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere toate programările eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 1.3 Obținere programări client
Write-Host "`n1.3. Test obținere programări client" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $clientToken"
    }
    $getClientAppointmentsResponse = Invoke-RestMethod -Uri "$baseUrl/appointments/client/3" -Method Get -Headers $headers
    Write-Host "Obținere programări client reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere programări client eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 1.4 Actualizare programare
Write-Host "`n1.4. Test actualizare programare" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $updateAppointmentResponse = Invoke-RestMethod -Uri "$baseUrl/appointments/$appointmentId" -Method Put -ContentType "application/json" -Headers $headers -Body (@{
        appointmentDate = "2025-08-16T15:30:00"
        duration = 45
        notes = "Consult stomatologic general - actualizat"
    } | ConvertTo-Json)
    Write-Host "Actualizare programare reușită!" -ForegroundColor Green
} catch {
    Write-Host "Actualizare programare eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 1.5 Anulare programare
Write-Host "`n1.5. Test anulare programare" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $clientToken"
    }
    $cancelAppointmentResponse = Invoke-RestMethod -Uri "$baseUrl/appointments/$appointmentId/cancel" -Method Put -Headers $headers
    Write-Host "Anulare programare reușită!" -ForegroundColor Green
} catch {
    Write-Host "Anulare programare eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

#---------------------------
# 2. TESTE API INVENTAR
#---------------------------
Write-Host "`n=== 2. TESTE API INVENTAR ===" -ForegroundColor Cyan

# 2.1 Adăugare articol
Write-Host "`n2.1. Test adăugare articol" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $addItemResponse = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        name = "Gel anestezic"
        description = "Gel anestezic pentru proceduri dentare"
        category = "Anestezice"
        quantity = 50
        unit = "ml"
        costPrice = 15.5
        sellingPrice = 25
        reorderLevel = 10
        expiryDate = "2026-12-31"
        supplier = "Medical Supplies SRL"
    } | ConvertTo-Json)
    Write-Host "Adăugare articol reușită!" -ForegroundColor Green
    $itemId = $addItemResponse.itemId
    if (-not $itemId) {
        $itemId = 1
        Write-Host "Nu s-a putut extrage ID-ul articolului. Se folosește ID implicit: 1" -ForegroundColor Yellow
    } else {
        Write-Host "ID Articol: $itemId"
    }
} catch {
    Write-Host "Adăugare articol eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    $itemId = 1
    Write-Host "Se folosește ID implicit pentru articol: 1" -ForegroundColor Yellow
}

# 2.2 Obținere toate articolele
Write-Host "`n2.2. Test obținere toate articolele" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $getAllItemsResponse = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    Write-Host "Obținere toate articolele reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere toate articolele eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2.3 Obținere articole cu stoc redus
Write-Host "`n2.3. Test obținere articole cu stoc redus" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $getLowStockItemsResponse = Invoke-RestMethod -Uri "$baseUrl/inventory/low-stock" -Method Get -Headers $headers
    Write-Host "Obținere articole cu stoc redus reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere articole cu stoc redus eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 2.4 Actualizare articol
Write-Host "`n2.4. Test actualizare articol" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $updateItemResponse = Invoke-RestMethod -Uri "$baseUrl/inventory/$itemId" -Method Put -ContentType "application/json" -Headers $headers -Body (@{
        quantity = 45
        sellingPrice = 27.5
        description = "Gel anestezic pentru proceduri dentare - formula îmbunătățită"
    } | ConvertTo-Json)
    Write-Host "Actualizare articol reușită!" -ForegroundColor Green
} catch {
    Write-Host "Actualizare articol eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

#---------------------------
# 3. TESTE API FACTURI
#---------------------------
Write-Host "`n=== 3. TESTE API FACTURI ===" -ForegroundColor Cyan

# 3.1 Creare factură
Write-Host "`n3.1. Test creare factură" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $createInvoiceResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        clientId = 3
        appointmentId = $appointmentId
        issueDate = "2025-07-28"
        dueDate = "2025-08-28"
        amount = 250
        status = "pending"
        description = "Consultație stomatologică + detartraj"
        items = @(
            @{
                description = "Consultație stomatologică"
                quantity = 1
                unitPrice = 100
                total = 100
            },
            @{
                description = "Detartraj"
                quantity = 1
                unitPrice = 150
                total = 150
            }
        )
        paymentMethod = "card"
        notes = "Factură pentru servicii stomatologice"
    } | ConvertTo-Json)
    Write-Host "Creare factură reușită!" -ForegroundColor Green
    $invoiceId = $createInvoiceResponse.invoiceId
    if (-not $invoiceId) {
        $invoiceId = 1
        Write-Host "Nu s-a putut extrage ID-ul facturii. Se folosește ID implicit: 1" -ForegroundColor Yellow
    } else {
        Write-Host "ID Factură: $invoiceId"
    }
} catch {
    Write-Host "Creare factură eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    $invoiceId = 1
    Write-Host "Se folosește ID implicit pentru factură: 1" -ForegroundColor Yellow
}

# 3.2 Obținere toate facturile
Write-Host "`n3.2. Test obținere toate facturile" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $getAllInvoicesResponse = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Get -Headers $headers
    Write-Host "Obținere toate facturile reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere toate facturile eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 3.3 Obținere facturi client
Write-Host "`n3.3. Test obținere facturi client" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $getClientInvoicesResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/client/3" -Method Get -Headers $headers
    Write-Host "Obținere facturi client reușită!" -ForegroundColor Green
} catch {
    Write-Host "Obținere facturi client eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 3.4 Actualizare factură
Write-Host "`n3.4. Test actualizare factură" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $employeeToken"
    }
    $updateInvoiceResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId" -Method Put -ContentType "application/json" -Headers $headers -Body (@{
        amount = 275
        description = "Consultație stomatologică + detartraj + radiografie"
        items = @(
            @{
                description = "Consultație stomatologică"
                quantity = 1
                unitPrice = 100
                total = 100
            },
            @{
                description = "Detartraj"
                quantity = 1
                unitPrice = 150
                total = 150
            },
            @{
                description = "Radiografie"
                quantity = 1
                unitPrice = 25
                total = 25
            }
        )
    } | ConvertTo-Json)
    Write-Host "Actualizare factură reușită!" -ForegroundColor Green
} catch {
    Write-Host "Actualizare factură eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# 3.5 Marcare factură ca plătită
Write-Host "`n3.5. Test marcare factură ca plătită" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $markPaidResponse = Invoke-RestMethod -Uri "$baseUrl/invoices/$invoiceId/pay" -Method Put -Headers $headers
    Write-Host "Marcare factură ca plătită reușită!" -ForegroundColor Green
} catch {
    Write-Host "Marcare factură ca plătită eșuată:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Raport final
Write-Host "`n=== Raport final ===" -ForegroundColor Yellow
Write-Host "Teste finalizate. Verifică rezultatele de mai sus pentru detalii." -ForegroundColor Green
