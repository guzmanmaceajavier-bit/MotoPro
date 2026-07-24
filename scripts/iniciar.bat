@echo off
title MotoPro - Taller de Motos
cd /d "%~dp0"

echo ====================================
echo   MotoPro - Taller de Motos
echo   Iniciando todos los servicios...
echo ====================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Instalalo desde https://nodejs.org
    pause
    exit /b 1
)

:: Verificar que las dependencias esten instaladas
if not exist "frontend\node_modules" (
    echo [FRONTEND] Instalando dependencias...
    cd frontend
    call npm install
    cd ..
)
if not exist "admin\node_modules" (
    echo [ADMIN] Instalando dependencias...
    cd admin
    call npm install
    cd ..
)
if not exist "backend\node_modules" (
    echo [BACKEND] Instalando dependencias...
    cd backend
    call npm install
    cd ..
)

:: Seed si la BD no existe
if not exist "data\database.sqlite" (
    echo [BACKEND] Ejecutando seed inicial...
    cd backend
    call npm run seed
    cd ..
)

echo.
echo ====================================
echo   Servicios:
echo   Frontend:  http://localhost:3000
echo   Admin:     http://localhost:3002
echo   API:       http://localhost:4000
echo ====================================
echo.
echo   Cerra esta ventana para detener todo.
echo ====================================
echo.

:: Iniciar los 3 servicios concurrentemente
npx concurrently -n FRONTEND,ADMIN,API -c cyan,green,yellow "npm run dev --prefix frontend" "npm run dev --prefix admin" "npm run dev --prefix backend"

pause
