[CmdletBinding()]
param(
    [ValidateSet('auto', 'docker', 'podman')]
    [string]$Engine = 'auto',
    [switch]$NoCache
)

$ErrorActionPreference = 'Stop'

function Test-ComposeCommand {
    param(
        [string]$Command,
        [string[]]$PrefixArguments
    )

    if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
        return $false
    }

    & $Command @PrefixArguments version *> $null
    return $LASTEXITCODE -eq 0
}

$tool = $null
$prefixArguments = @()

if ($Engine -in @('auto', 'docker') -and (Test-ComposeCommand -Command 'docker' -PrefixArguments @('compose'))) {
    $tool = 'docker'
    $prefixArguments = @('compose')
}
elseif ($Engine -in @('auto', 'podman') -and (Test-ComposeCommand -Command 'podman' -PrefixArguments @('compose'))) {
    $tool = 'podman'
    $prefixArguments = @('compose')
}
elseif ($Engine -in @('auto', 'podman') -and (Get-Command podman-compose -ErrorAction SilentlyContinue)) {
    $tool = 'podman-compose'
}
else {
    throw 'No supported container engine found. Install Docker Desktop or Podman with Compose support.'
}

$buildArguments = @($prefixArguments + @('build'))
if ($NoCache) {
    $buildArguments += '--no-cache'
}

Write-Host "Building containers with $tool $($prefixArguments -join ' ')..." -ForegroundColor Cyan
& $tool @buildArguments
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Container build completed successfully.' -ForegroundColor Green
