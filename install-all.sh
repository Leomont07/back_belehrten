#!/bin/bash
# Habilita el modo para detener el script si ocurre algún error
set -e

# Instalando dependencias en archivo principal
echo "Instalando dependencias en principal..."
npm install

# Instalando dependencias en gateway
echo "Instalando dependencias en gateway..."
cd gateway
npm install
cd ..

# Instalando dependencias en auth
echo "Instalando dependencias en auth..."
cd services/auth
npm install
cd ..

# Instalando dependencias en plan
echo "Instalando dependencias en plan..."
cd study_plan
npm install
cd ..

# Instalando dependencias en users
echo "Instalando dependencias en users..."
cd users
npm install
cd ..

# Instalando dependencias en NOTIFICACIONES
echo "Instalando dependencias en notificaciones..."
cd notifications
npm install
cd ..

# Instalando dependencias en tests
echo "Instalando dependencias en tests..."
cd tests
npm install
cd ../..

echo "Instalación de dependencias completada!"