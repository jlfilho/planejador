$ErrorActionPreference = 'Stop'

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][scriptblock]$Command
  )

  Write-Host "`n==> $Name" -ForegroundColor Cyan
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $Name (exit code $LASTEXITCODE)"
  }
}

if (-not (Test-Path -LiteralPath 'apps/api/.env' -PathType Leaf)) {
  throw 'Missing apps/api/.env. Copy .env.example to apps/api/.env and configure the required secrets before starting.'
}

Invoke-Step 'Starting PostgreSQL container' { docker compose up -d }
Invoke-Step 'Installing dependencies' { pnpm install }
Invoke-Step 'Generating Prisma client' { pnpm --filter @planejador/api prisma:generate }
Invoke-Step 'Applying Prisma migrations' { pnpm --filter @planejador/api prisma:migrate }
Invoke-Step 'Bootstrapping the initial ADMIN account' { pnpm --filter @planejador/api admin:bootstrap }

Write-Host "`n==> Starting development servers (press Ctrl+C to stop)" -ForegroundColor Cyan
pnpm dev
exit $LASTEXITCODE
