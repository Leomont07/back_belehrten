set -e

echo "Instalando dependencias en principal..."
npm install

echo "Instalando dependencias en gateway..."
cd gateway
npm install
cd ..

echo "Instalando dependencias en auth..."
cd services/auth
npm install
cd ..

echo "Instalando dependencias en plan..."
cd study_plan
npm install
cd ..

echo "Instalando dependencias en users..."
cd users
npm install
cd ..

echo "Instalando dependencias en notificaciones..."
cd notifications
npm install
cd ..

echo "Instalando dependencias en tests..."
cd tests
npm install
cd ../..

echo "Instalación de dependencias completada!"