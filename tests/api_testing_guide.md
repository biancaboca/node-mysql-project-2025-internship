# Teste API pentru Clinica Dentară

Acest document conține instrucțiuni pentru testarea API-urilor pentru programări, inventar și facturi.

## Configurare

Înainte de a rula testele, asigură-te că:

1. Serverul API rulează pe `http://localhost:3000`
2. Ai obținut token-uri de autentificare pentru diferite roluri:
   - Admin: `admin_token`
   - Client: `user_token`
   - Admin sau angajat: `admin_or_employee_token`

## 1. API Programări (Appointments)

### 1.1 Creare programare

```
POST http://localhost:3000/api/appointments
Content-Type: application/json
Authorization: Bearer {{user_token}}

{
    "clientId": 3,
    "employeeId": 2,
    "appointmentDate": "2025-08-15T14:00:00",
    "duration": 60,
    "notes": "Consult stomatologic general",
    "status": "scheduled"
}
```

### 1.2 Obținere toate programările

```
GET http://localhost:3000/api/appointments
Authorization: Bearer {{admin_or_employee_token}}
```

### 1.3 Obținere programări client

```
GET http://localhost:3000/api/appointments/client/3
Authorization: Bearer {{user_token}}
```

### 1.4 Obținere programări angajat

```
GET http://localhost:3000/api/appointments/employee/2
Authorization: Bearer {{admin_or_employee_token}}
```

### 1.5 Obținere programare după ID

```
GET http://localhost:3000/api/appointments/1
Authorization: Bearer {{user_token}}
```

### 1.6 Actualizare programare

```
PUT http://localhost:3000/api/appointments/1
Content-Type: application/json
Authorization: Bearer {{admin_or_employee_token}}

{
    "appointmentDate": "2025-08-16T15:30:00",
    "duration": 45,
    "notes": "Consult stomatologic general - actualizat"
}
```

### 1.7 Anulare programare

```
PUT http://localhost:3000/api/appointments/1/cancel
Authorization: Bearer {{user_token}}
```

### 1.8 Finalizare programare

```
PUT http://localhost:3000/api/appointments/1/complete
Authorization: Bearer {{admin_or_employee_token}}
```

### 1.9 Ștergere programare

```
DELETE http://localhost:3000/api/appointments/1
Authorization: Bearer {{admin_token}}
```

## 2. API Inventar (Inventory)

### 2.1 Adăugare articol

```
POST http://localhost:3000/api/inventory
Content-Type: application/json
Authorization: Bearer {{admin_or_employee_token}}

{
    "name": "Gel anestezic",
    "description": "Gel anestezic pentru proceduri dentare",
    "category": "Anestezice",
    "quantity": 50,
    "unit": "ml",
    "costPrice": 15.5,
    "sellingPrice": 25,
    "reorderLevel": 10,
    "expiryDate": "2026-12-31",
    "supplier": "Medical Supplies SRL"
}
```

### 2.2 Obținere toate articolele

```
GET http://localhost:3000/api/inventory
Authorization: Bearer {{admin_or_employee_token}}
```

### 2.3 Obținere articole cu stoc redus

```
GET http://localhost:3000/api/inventory/low-stock
Authorization: Bearer {{admin_or_employee_token}}
```

### 2.4 Obținere articol după ID

```
GET http://localhost:3000/api/inventory/1
Authorization: Bearer {{admin_or_employee_token}}
```

### 2.5 Actualizare articol

```
PUT http://localhost:3000/api/inventory/1
Content-Type: application/json
Authorization: Bearer {{admin_or_employee_token}}

{
    "quantity": 45,
    "sellingPrice": 27.5,
    "description": "Gel anestezic pentru proceduri dentare - formula îmbunătățită"
}
```

### 2.6 Ștergere articol

```
DELETE http://localhost:3000/api/inventory/1
Authorization: Bearer {{admin_token}}
```

## 3. API Facturi (Invoices)

### 3.1 Creare factură

```
POST http://localhost:3000/api/invoices
Content-Type: application/json
Authorization: Bearer {{admin_or_employee_token}}

{
    "clientId": 3,
    "appointmentId": 1,
    "issueDate": "2025-07-28",
    "dueDate": "2025-08-28",
    "amount": 250,
    "status": "pending",
    "description": "Consultație stomatologică + detartraj",
    "items": [
        {
            "description": "Consultație stomatologică",
            "quantity": 1,
            "unitPrice": 100,
            "total": 100
        },
        {
            "description": "Detartraj",
            "quantity": 1,
            "unitPrice": 150,
            "total": 150
        }
    ],
    "paymentMethod": "card",
    "notes": "Factură pentru servicii stomatologice"
}
```

### 3.2 Obținere toate facturile

```
GET http://localhost:3000/api/invoices
Authorization: Bearer {{admin_or_employee_token}}
```

### 3.3 Obținere facturi client

```
GET http://localhost:3000/api/invoices/client/3
Authorization: Bearer {{admin_or_employee_token}}
```

### 3.4 Obținere facturi în așteptare

```
GET http://localhost:3000/api/invoices/pending
Authorization: Bearer {{admin_or_employee_token}}
```

### 3.5 Obținere facturi plătite

```
GET http://localhost:3000/api/invoices/paid
Authorization: Bearer {{admin_or_employee_token}}
```

### 3.6 Obținere factură după ID

```
GET http://localhost:3000/api/invoices/1
Authorization: Bearer {{user_token}}
```

### 3.7 Actualizare factură

```
PUT http://localhost:3000/api/invoices/1
Content-Type: application/json
Authorization: Bearer {{admin_or_employee_token}}

{
    "amount": 275,
    "description": "Consultație stomatologică + detartraj + radiografie",
    "items": [
        {
            "description": "Consultație stomatologică",
            "quantity": 1,
            "unitPrice": 100,
            "total": 100
        },
        {
            "description": "Detartraj",
            "quantity": 1,
            "unitPrice": 150,
            "total": 150
        },
        {
            "description": "Radiografie",
            "quantity": 1,
            "unitPrice": 25,
            "total": 25
        }
    ]
}
```

### 3.8 Marcare factură ca plătită

```
PUT http://localhost:3000/api/invoices/1/pay
Authorization: Bearer {{admin_or_employee_token}}
```

### 3.9 Ștergere factură

```
DELETE http://localhost:3000/api/invoices/1
Authorization: Bearer {{admin_token}}
```

## Note de utilizare

1. Înlocuiește `{{admin_token}}`, `{{user_token}}` și `{{admin_or_employee_token}}` cu token-urile JWT obținute după autentificare
2. Ajustează ID-urile (pentru clienți, angajați, programări, articole și facturi) conform bazei tale de date
3. Verifică răspunsurile primite pentru a te asigura că operațiile au fost efectuate cu succes
4. Pentru token-uri, poți folosi variabile de mediu în Postman sau le poți înlocui manual
