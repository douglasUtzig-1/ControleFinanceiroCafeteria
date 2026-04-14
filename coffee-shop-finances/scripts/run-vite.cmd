@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0.."

set "NODE_TOOLS="
if exist ".tools\node\node.exe" set "NODE_TOOLS=%CD%\.tools\node"

if not defined NODE_TOOLS (
  for /d %%D in (.tools\node-v*-win-x64) do (
    if exist "%%~fD\node.exe" (
      set "NODE_TOOLS=%%~fD"
      goto :found_tools
    )
  )
)
:found_tools

if defined NODE_TOOLS set "PATH=%NODE_TOOLS%;%PATH%"

where node >nul 2>&1
if errorlevel 1 (
  echo [erro] Node.js nao encontrado. Instale Node ^(PATH^) ou execute dev-portable.cmd para usar o Node portatil.
  exit /b 1
)

node "node_modules\vite\bin\vite.js" %*
