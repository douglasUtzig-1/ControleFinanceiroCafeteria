# Servidor de desenvolvimento sem Node instalado na máquina (sem admin):
# baixa o ZIP oficial do Node para .tools/ e executa `npm run dev`.
# Uso: .\scripts\dev-portable.ps1   ou   duplo clique em dev-portable.cmd

$ErrorActionPreference = 'Stop'

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$ToolsDir = Join-Path $ProjectRoot '.tools'

# Versão LTS fixa (altere aqui se precisar atualizar)
$NodeVersion = '20.18.1'
$NodeDirName = "node-v$NodeVersion-win-x64"
$NodeHome = Join-Path $ToolsDir $NodeDirName
$ZipUrl = "https://nodejs.org/dist/v$NodeVersion/$NodeDirName.zip"
$ZipPath = Join-Path $ToolsDir "$NodeDirName.zip"

function Test-NodeReady {
  param([string]$NodeDir)
  return (Test-Path (Join-Path $NodeDir 'node.exe')) -and (Test-Path (Join-Path $NodeDir 'npm.cmd'))
}

if (-not (Test-NodeReady -NodeDir $NodeHome)) {
  Write-Host "Node não encontrado em $NodeHome" -ForegroundColor Yellow
  Write-Host "Baixando Node.js $NodeVersion (ZIP oficial, sem instalador/admin)..." -ForegroundColor Cyan

  New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null

  if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }

  try {
    Invoke-WebRequest -Uri $ZipUrl -OutFile $ZipPath -UseBasicParsing
  } catch {
    Write-Host "Falha ao baixar: $ZipUrl" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
  }

  if (Test-Path $NodeHome) { Remove-Item -Recurse -Force $NodeHome }

  try {
    Expand-Archive -Path $ZipPath -DestinationPath $ToolsDir -Force
  } catch {
    Write-Host "Falha ao extrair o ZIP. Verifique espaço em disco e permissões na pasta do projeto." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
  }

  Remove-Item -Force $ZipPath -ErrorAction SilentlyContinue

  if (-not (Test-NodeReady -NodeDir $NodeHome)) {
    Write-Host "Extração concluída, mas node.exe/npm.cmd não foram encontrados em $NodeHome" -ForegroundColor Red
    exit 1
  }

  Write-Host "Node portátil pronto em $NodeHome" -ForegroundColor Green
}

$env:Path = "$NodeHome;$env:Path"

Set-Location $ProjectRoot

if (-not (Test-Path (Join-Path $ProjectRoot 'node_modules'))) {
  Write-Host "Instalando dependências (npm install)..." -ForegroundColor Cyan
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Iniciando Vite (npm run dev)..." -ForegroundColor Cyan
Write-Host "Abra no navegador: http://localhost:8080/ (porta definida em vite.config.ts)" -ForegroundColor Green

& npm.cmd run dev
