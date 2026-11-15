param(
    [string]$InstallRoot = (Join-Path $env:USERPROFILE '.codex\skills'),
    [switch]$SkipSetup
)
$ErrorActionPreference = 'Stop'
$Source = [IO.Path]::GetFullPath($PSScriptRoot)
$Target = [IO.Path]::GetFullPath((Join-Path $InstallRoot 'cjx-sketchmind'))
if (-not (Test-Path -LiteralPath (Join-Path $Source 'SKILL.md'))) { throw 'SKILL.md not found.' }
if ($Source -ne $Target) {
    # Reject a nested copy into our own source; leave an existing target intact.
    if ($Target.StartsWith($Source + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'The install target cannot be nested inside the source skill.'
    }
    New-Item -ItemType Directory -Force -Path $Target | Out-Null
    # Installing from a checkout must not copy its repository metadata or dependencies.
    Get-ChildItem -LiteralPath $Source -Force | Where-Object {
        $_.Name -notin @('.git', '.gitignore', '.github', 'node_modules', '.cache', '.venv', '__pycache__', 'output', 'outputs', 'artifacts', 'dist', 'target') -and
        $_.Name -notlike '.env*' -and $_.Extension -notin @('.pem', '.key', '.log')
    } | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $Target -Recurse -Force
    }
}
if (-not $SkipSetup) { & (Join-Path $Target 'scripts\setup.ps1') }
Write-Host "cjx-sketchmind installed: $Target"
