# test-server.ps1
# Instala dependencias, inicia el servidor MCP y envía una query de prueba.
# Ejecutar desde la carpeta mcp-server:
#   cd mcp-server
#   powershell -ExecutionPolicy Bypass -File test-server.ps1

Set-Location $PSScriptRoot

Write-Host "`n=== 1. Installing dependencies ===" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n=== 2. Verifying knowledge base ===" -ForegroundColor Cyan
$kbPath = Join-Path $PSScriptRoot "knowledge-base"
$docs = Get-ChildItem $kbPath -Filter "*.md" -ErrorAction SilentlyContinue
if ($docs.Count -eq 0) {
    Write-Host "WARNING: No .md files in knowledge-base/" -ForegroundColor Yellow
} else {
    $docs | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Green }
}

Write-Host "`n=== 3. Starting MCP server (5s smoke test) ===" -ForegroundColor Cyan

# Envía un mensaje JSON-RPC válido al servidor via stdin y captura stdout
$initMessage  = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0"}}}'
$listMessage  = '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
$queryMessage = '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"query_knowledge_base","arguments":{"query":"UX guidelines formularios"}}}'

$input = "$initMessage`n$listMessage`n$queryMessage`n"

Write-Host "Sending test messages to server..." -ForegroundColor Yellow
$output = $input | node rag-mcp-server.js 2>&1
$lines = $output -split "`n" | Where-Object { $_.Trim() -ne "" } | Select-Object -First 30

Write-Host "`n=== 4. Server output ===" -ForegroundColor Cyan
$lines | ForEach-Object {
    try {
        $json = $_ | ConvertFrom-Json -ErrorAction Stop
        Write-Host ($json | ConvertTo-Json -Depth 4) -ForegroundColor Green
    } catch {
        Write-Host $_ -ForegroundColor Gray
    }
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "If you see JSON responses above with 'result' fields, the server is working correctly." -ForegroundColor White
Write-Host "Register with Claude: claude mcp add ux-rag-server -- node $PSScriptRoot\rag-mcp-server.js" -ForegroundColor White
