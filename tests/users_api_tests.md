# Instrucțiuni pentru testarea API-ului de utilizatori

Acest document conține instrucțiuni pentru testarea API-ului de utilizatori folosind Postman.

## Configurarea colecției de teste

1. Deschide Postman
2. Apasă pe butonul "Import" din bara de sus
3. Importă fișierul `users_api_tests.json` din directorul `tests`
4. Vei vedea o nouă colecție numită "Users API Tests"

## Setarea variabilelor de mediu

Înainte de a rula testele, trebuie să obții token-uri de autentificare pentru diferite roluri și să le configurezi în variabilele de mediu:

1. Creează un mediu nou în Postman (click pe "Environment" în bara laterală)
2. Adaugă următoarele variabile:
   - `admin_token`: Token JWT pentru un utilizator admin
   - `user_token`: Token JWT pentru un utilizator client
   - `admin_or_employee_token`: Token JWT pentru un admin sau angajat

## Obținerea token-urilor de autentificare

Pentru a obține token-urile, trebuie să te autentifici folosind endpoint-ul de login:

```
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "parola_adminului"
}
```

După autentificare, copiază token-ul primit în răspuns și adaugă-l în variabila de mediu corespunzătoare.

## Structura colecției de teste

Colecția include următoarele teste pentru fiecare endpoint al API-ului de utilizatori:

1. **Înregistrare client (public)**
   - Metodă: `POST`
   - URL: `http://localhost:3000/api/users/register`
   - Nu necesită autentificare

2. **Creare admin**
   - Metodă: `POST`
   - URL: `http://localhost:3000/api/users/admin`
   - Necesită token de admin

3. **Creare angajat**
   - Metodă: `POST`
   - URL: `http://localhost:3000/api/users/employee`
   - Necesită token de admin

4. **Creare client (de către personal)**
   - Metodă: `POST`
   - URL: `http://localhost:3000/api/users/client`
   - Necesită token de admin sau angajat

5. **Creare utilizator generic**
   - Metodă: `POST`
   - URL: `http://localhost:3000/api/users`
   - Necesită token cu permisiuni

6. **Obținere profil propriu**
   - Metodă: `GET`
   - URL: `http://localhost:3000/api/users/profile`
   - Necesită token

7. **Actualizare profil propriu**
   - Metodă: `PUT`
   - URL: `http://localhost:3000/api/users/profile`
   - Necesită token

8. **Obținere toți utilizatorii**
   - Metodă: `GET`
   - URL: `http://localhost:3000/api/users`
   - Necesită token cu permisiuni

9. **Obținere utilizatori după rol**
   - Metodă: `GET`
   - URL: `http://localhost:3000/api/users/role/:role`
   - Necesită token cu permisiuni

10. **Obținere toți adminii**
    - Metodă: `GET`
    - URL: `http://localhost:3000/api/users/admins/all`
    - Necesită token de admin

11. **Obținere toți angajații**
    - Metodă: `GET`
    - URL: `http://localhost:3000/api/users/employees/all`
    - Necesită token de admin sau angajat

12. **Obținere toți clienții**
    - Metodă: `GET`
    - URL: `http://localhost:3000/api/users/clients/all`
    - Necesită token cu permisiuni

13. **Obținere utilizator după ID**
    - Metodă: `GET`
    - URL: `http://localhost:3000/api/users/:id`
    - Necesită token (utilizatorii pot accesa doar propriul profil)

14. **Actualizare utilizator**
    - Metodă: `PUT`
    - URL: `http://localhost:3000/api/users/:id`
    - Necesită token (utilizatorii pot actualiza doar propriul profil)

15. **Schimbare parolă**
    - Metodă: `PUT`
    - URL: `http://localhost:3000/api/users/:id/change-password`
    - Necesită token (utilizatorii pot schimba doar propria parolă)

16. **Ștergere utilizator**
    - Metodă: `DELETE`
    - URL: `http://localhost:3000/api/users/:id`
    - Necesită token cu permisiuni

## Rularea testelor

Pentru a rula un test:

1. Asigură-te că serverul API rulează pe `http://localhost:3000`
2. Selectează mediul configurat din dropdown-ul de mediu
3. Selectează testul pe care dorești să îl rulezi din colecție
4. Apasă butonul "Send" pentru a executa cererea

## Note importante

- Înainte de a rula testele, asigură-te că baza de date este configurată corect
- Pentru testele care modifică date (POST, PUT, DELETE), verifică răspunsurile pentru a te asigura că operațiile au fost efectuate cu succes
- Adaptează ID-urile utilizatorilor din URL-uri la ID-urile reale din baza de date
