param([switch]$SkipSmoke)
$ErrorActionPreference = 'Stop'
$NodeVersion = & node -p 'process.versions.node'
if ($LASTEXITCODE -ne 0 -or [int]($NodeVersion.Split('.')[0]) -lt 22) {
    throw 'cjx-sketchmind requires Node.js 22 or newer.'
}
$Runner = Join-Path $PSScriptRoot 'excalidraw.mjs'
& node $Runner doctor
if ($LASTEXITCODE -ne 0) {
    # Pin the version verified with this Skill; future upgrades are explicit.
    & npm install -g '@excalidraw/cli@0.3.0' --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Excalidraw CLI installation failed.' }
}
if ($SkipSmoke) { & node $Runner doctor }
else { & node $Runner doctor --smoke }
if ($LASTEXITCODE -ne 0) { throw 'cjx-sketchmind environment check failed. See the error above.' }
Write-Host 'cjx-sketchmind local Excalidraw is ready. No account or API key is required.'
