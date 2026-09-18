param(
    [int]$BackendPort = 8081,
    [int]$FrontendPort = 3000,
    [string]$FrontendUrl = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$envFile = Join-Path $root '.env'
$envExample = Join-Path $root '.env.example'

function Load-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith('#')) {
            return
        }

        $parts = $line.Split('=', 2)
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"')
        if ($key -and -not [string]::IsNullOrWhiteSpace($value)) {
            [System.Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "Created .env from .env.example" -ForegroundColor Yellow
    }
}

Load-EnvFile -Path $envFile

$env:FRONTEND_URL = $FrontendUrl
$env:PORT = [string]$BackendPort
$env:VITE_PORT = [string]$FrontendPort

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Node.js is not installed or not on PATH. Install Node.js 20+ and try again.'
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error 'npm is not installed or not on PATH.'
    exit 1
}

function Ensure-Dependencies {
    param([string]$Dir)

    if (-not (Test-Path (Join-Path $Dir 'node_modules'))) {
        Write-Host "Installing dependencies in $Dir" -ForegroundColor Cyan
        Push-Location $Dir
        try {
            npm install
        }
        finally {
            Pop-Location
        }
    }
}

Ensure-Dependencies -Dir $backendDir
Ensure-Dependencies -Dir $frontendDir

$backendLog = Join-Path $root 'backend-run.log'
$frontendLog = Join-Path $root 'frontend-run.log'

Write-Host 'Starting backend...' -ForegroundColor Green
Start-Process pwsh -ArgumentList @('-NoExit', '-NoProfile', '-Command', "Set-Location '$backendDir'; `$env:FRONTEND_URL='$FrontendUrl'; `$env:PORT='$BackendPort'; npm start") -WorkingDirectory $backendDir

Write-Host 'Starting frontend...' -ForegroundColor Green
Start-Process pwsh -ArgumentList @('-NoExit', '-NoProfile', '-Command', "Set-Location '$frontendDir'; `$env:VITE_PORT='$FrontendPort'; npm run dev -- --host 0.0.0.0 --port $FrontendPort") -WorkingDirectory $frontendDir

Write-Host "" 
Write-Host 'Project started successfully.' -ForegroundColor Green
Write-Host "Backend URL: http://localhost:$BackendPort/api" -ForegroundColor Cyan
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Cyan
Write-Host "" 
Write-Host 'Useful tips:' -ForegroundColor Yellow
Write-Host '  - Admin login: http://localhost:3000/login' -ForegroundColor Gray
Write-Host '  - Donor user login: same page, then choose Normal User' -ForegroundColor Gray
Write-Host '  - Stop the processes from the terminal windows when you are done.' -ForegroundColor Gray
