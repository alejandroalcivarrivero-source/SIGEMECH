@echo off
title Limpiador de Procesos SIGEMECH
echo ===========================================
echo   DETENIENDO PROCESOS DE NODE Y VITE
echo ===========================================

:: Mata todos los procesos de Node.js (Backend y Frontend)
taskkill /F /IM node.exe /T >nul 2>&1

:: Mata procesos específicos de Vite/Esbuild
taskkill /F /IM esbuild.exe /T >nul 2>&1

echo.
echo [OK] Procesos de Node/Vite finalizados.
echo.
echo ===========================================
echo   LIMPIANDO CACHE DE VITE (Opcional)
echo ===========================================
:: Esto borra la carpeta de cache de dependencias de Vite si existe
if exist "D:\SIGEMECH\frontend\node_modules\.vite" (
    rd /s /q "D:\SIGEMECH\frontend\node_modules\.vite"
    echo [OK] Cache de Vite eliminada.
)

echo.
echo Sistema limpio. Ya puedes ejecutar npm run dev.
pause