$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$distPath = Join-Path $projectRoot "dist"
$clientPath = Join-Path $distPath "client"
$serverPath = Join-Path $distPath "server"

$expectedDistPath = [System.IO.Path]::GetFullPath(
  (Join-Path $projectRoot "dist")
)

if ([System.IO.Path]::GetFullPath($distPath) -ne $expectedDistPath) {
  throw "Refusing to build outside the project dist directory."
}

if (Test-Path -LiteralPath $distPath) {
  Remove-Item -LiteralPath $distPath -Recurse -Force
}

New-Item -ItemType Directory -Path $clientPath, $serverPath | Out-Null

Get-ChildItem -LiteralPath $projectRoot -File -Filter "*.html" |
  Copy-Item -Destination $clientPath

Copy-Item -LiteralPath (Join-Path $projectRoot "assets") `
  -Destination $clientPath `
  -Recurse

Copy-Item -LiteralPath (Join-Path $projectRoot "worker\index.js") `
  -Destination (Join-Path $serverPath "index.js")

Write-Output "Static site built in $distPath"
