@echo off
chcp 65001 >nul
title LeBon AI
color 0F
echo.
echo  ██████████████████████████████████████
echo   LeBon AI  —  Transfo IA 360
echo   leboncoin
echo  ██████████████████████████████████████
echo.

set DIR=%~dp0

:: ── Ollama ──────────────────────────────
set OLLAMA_ORIGINS=*
set OLLAMA_BIN=

where ollama >nul 2>&1
if %errorlevel%==0 (
  set OLLAMA_BIN=ollama
  goto :ollama_found
)
if exist "%DIR%ollama.exe" (
  set OLLAMA_BIN="%DIR%ollama.exe"
  goto :ollama_found
)
echo  [ERREUR] Ollama introuvable.
echo  Installe-le ici : https://ollama.com  (1 clic)
echo  Puis relance LeBon-AI.bat
pause
exit /b 1

:ollama_found
echo  [1/3] Demarrage du moteur IA...
start "" /B cmd /c "%OLLAMA_BIN% serve > "%DIR%ollama.log" 2>&1"
timeout /t 3 /nobreak >nul

:: ── Node ────────────────────────────────
set NODE_BIN=

where node >nul 2>&1
if %errorlevel%==0 (
  set NODE_BIN=node
  goto :node_found
)
if exist "%DIR%node.exe" (
  set NODE_BIN="%DIR%node.exe"
  goto :node_found
)
echo  [ERREUR] Node.js introuvable.
echo  Installe-le ici : https://nodejs.org  (version LTS)
echo  Puis relance LeBon-AI.bat
pause
exit /b 1

:node_found
echo  [2/3] Demarrage du serveur LeBon AI...
start "" /B cmd /c "%NODE_BIN% "%DIR%server.js" > "%DIR%server.log" 2>&1"
timeout /t 2 /nobreak >nul

:: ── Navigateur ──────────────────────────
echo  [3/3] Ouverture dans le navigateur...
start http://localhost:4321

echo.
echo  LeBon AI est pret sur http://localhost:4321
echo  Ferme cette fenetre pour tout arreter.
echo.
pause
taskkill /F /IM ollama.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
