Set-Location $PSScriptRoot

Write-Host "=== Creating commit ===" -ForegroundColor Cyan
git add .
git commit -m "feat: Product AI - Material Web migration, gemini service updates, and project setup`n`nCo-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

Write-Host "`n=== Commit created ===" -ForegroundColor Green
git log --oneline -5

Write-Host "`nReady to push to GitHub. Run: git push origin main"
