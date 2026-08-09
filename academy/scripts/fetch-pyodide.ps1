$ErrorActionPreference = "Stop"

$PyodideVersion = "314.0.2"
$Root = Split-Path -Parent $PSScriptRoot
$Target = Join-Path $Root "pyodide"
$BaseUrl = "https://cdn.jsdelivr.net/pyodide/v$PyodideVersion/full"
$Files = @(
    "pyodide.js",
    "pyodide.asm.mjs",
    "pyodide.asm.wasm",
    "python_stdlib.zip",
    "pyodide-lock.json"
)

New-Item -ItemType Directory -Force -Path $Target | Out-Null

foreach ($File in $Files) {
    Invoke-WebRequest -Uri "$BaseUrl/$File" -OutFile (Join-Path $Target $File)
}

Write-Host "Pyodide $PyodideVersion downloaded to $Target"
