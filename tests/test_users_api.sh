#!/bin/bash
# Script pentru testarea API-ului de utilizatori

# Configurare
BASE_URL="http://localhost:3000/api/users"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
CLIENT_EMAIL="client@example.com"
CLIENT_PASSWORD="client123"

# Culori pentru output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testare API Utilizatori ===${NC}"

# Obține token admin
echo -e "\n${YELLOW}Obțin token admin...${NC}"
ADMIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" $BASE_URL/login)
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}Nu s-a putut obține token admin. Verifică credențialele.${NC}"
  exit 1
fi

echo -e "${GREEN}Token admin obținut cu succes!${NC}"

# Obține token client
echo -e "\n${YELLOW}Obțin token client...${NC}"
CLIENT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"$CLIENT_EMAIL\",\"password\":\"$CLIENT_PASSWORD\"}" $BASE_URL/login)
CLIENT_TOKEN=$(echo $CLIENT_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$CLIENT_TOKEN" ]; then
  echo -e "${RED}Nu s-a putut obține token client. Verifică credențialele.${NC}"
  exit 1
fi

echo -e "${GREEN}Token client obținut cu succes!${NC}"

# 1. Test înregistrare client (public)
echo -e "\n${YELLOW}1. Test înregistrare client (public)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"nou_client@example.com\",\"password\":\"parola123\",\"firstName\":\"Client\",\"lastName\":\"Nou\",\"role\":\"client\"}" $BASE_URL/register)

if echo $REGISTER_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Înregistrare client reușită!${NC}"
else
  echo -e "${RED}Înregistrare client eșuată:${NC} $REGISTER_RESPONSE"
fi

# 2. Test creare admin
echo -e "\n${YELLOW}2. Test creare admin${NC}"
CREATE_ADMIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d "{\"email\":\"nou_admin@example.com\",\"password\":\"parola123\",\"firstName\":\"Admin\",\"lastName\":\"Nou\"}" $BASE_URL/admin)

if echo $CREATE_ADMIN_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Creare admin reușită!${NC}"
else
  echo -e "${RED}Creare admin eșuată:${NC} $CREATE_ADMIN_RESPONSE"
fi

# 3. Test creare angajat
echo -e "\n${YELLOW}3. Test creare angajat${NC}"
CREATE_EMPLOYEE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d "{\"email\":\"nou_angajat@example.com\",\"password\":\"parola123\",\"firstName\":\"Angajat\",\"lastName\":\"Nou\",\"department\":\"Medical\"}" $BASE_URL/employee)

if echo $CREATE_EMPLOYEE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Creare angajat reușită!${NC}"
else
  echo -e "${RED}Creare angajat eșuată:${NC} $CREATE_EMPLOYEE_RESPONSE"
fi

# 4. Test creare client (de către personal)
echo -e "\n${YELLOW}4. Test creare client (de către personal)${NC}"
CREATE_CLIENT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" -d "{\"email\":\"client_creat@example.com\",\"password\":\"parola123\",\"firstName\":\"Client\",\"lastName\":\"Creat\"}" $BASE_URL/client)

if echo $CREATE_CLIENT_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Creare client de către personal reușită!${NC}"
else
  echo -e "${RED}Creare client de către personal eșuată:${NC} $CREATE_CLIENT_RESPONSE"
fi

# 5. Test obținere profil propriu
echo -e "\n${YELLOW}5. Test obținere profil propriu${NC}"
PROFILE_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $CLIENT_TOKEN" $BASE_URL/profile)

if echo $PROFILE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Obținere profil propriu reușită!${NC}"
else
  echo -e "${RED}Obținere profil propriu eșuată:${NC} $PROFILE_RESPONSE"
fi

# 6. Test actualizare profil propriu
echo -e "\n${YELLOW}6. Test actualizare profil propriu${NC}"
UPDATE_PROFILE_RESPONSE=$(curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $CLIENT_TOKEN" -d "{\"phone\":\"0799999999\"}" $BASE_URL/profile)

if echo $UPDATE_PROFILE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Actualizare profil propriu reușită!${NC}"
else
  echo -e "${RED}Actualizare profil propriu eșuată:${NC} $UPDATE_PROFILE_RESPONSE"
fi

# 7. Test obținere toți utilizatorii
echo -e "\n${YELLOW}7. Test obținere toți utilizatorii${NC}"
ALL_USERS_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $BASE_URL)

if echo $ALL_USERS_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Obținere toți utilizatorii reușită!${NC}"
else
  echo -e "${RED}Obținere toți utilizatorii eșuată:${NC} $ALL_USERS_RESPONSE"
fi

# 8. Test obținere utilizatori după rol
echo -e "\n${YELLOW}8. Test obținere utilizatori după rol${NC}"
USERS_BY_ROLE_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $BASE_URL/role/client)

if echo $USERS_BY_ROLE_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Obținere utilizatori după rol reușită!${NC}"
else
  echo -e "${RED}Obținere utilizatori după rol eșuată:${NC} $USERS_BY_ROLE_RESPONSE"
fi

# 9. Test obținere toți adminii
echo -e "\n${YELLOW}9. Test obținere toți adminii${NC}"
ALL_ADMINS_RESPONSE=$(curl -s -X GET -H "Authorization: Bearer $ADMIN_TOKEN" $BASE_URL/admins/all)

if echo $ALL_ADMINS_RESPONSE | grep -q '"success":true'; then
  echo -e "${GREEN}Obținere toți adminii reușită!${NC}"
else
  echo -e "${RED}Obținere toți adminii eșuată:${NC} $ALL_ADMINS_RESPONSE"
fi

# Raport final
echo -e "\n${YELLOW}=== Raport final ===${NC}"
echo -e "${GREEN}Teste finalizate. Verifică rezultatele de mai sus pentru detalii.${NC}"
