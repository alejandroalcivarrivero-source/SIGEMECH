@echo off
title Limpiador de Entorno SIGEMECH
echo ---------------------------------------------------------
echo           LIMPIEZA DE PUERTOS Y PROCESOS NODE.JS
echo ---------------------------------------------------------

:: 1. Matar todos los procesos de Node.js de forma forzada
echo [*] Finalizando todas las instancias de Node.exe...
taskkill /F /IM node.exe /T >nul 2>&1

:: 2. Liberar específicamente el puerto del Backend (3002)
echo [*] Liberando puerto 3002 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /F /PID %%a >nul 2>&1

:: 3. Liberar específicamente el puerto del Frontend (5174)
echo [*] Liberando puerto 5174 (Vite/React)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /F /PID %%a >nul 2>&1

echo ---------------------------------------------------------
echo [OK] Entorno limpio. Puedes ejecutar 'npm run dev' ahora.
echo ---------------------------------------------------------
pause