$ErrorActionPreference = 'Stop'

$apiRoot = Split-Path -Parent $PSScriptRoot
$tsc = Join-Path $apiRoot 'node_modules\.bin\tsc.cmd'
$tsconfig = Join-Path $apiRoot 'tsconfig.build.json'
$entrypoint = Join-Path $apiRoot 'dist\main.js'

# Compile once before starting Node so that emitted decorator metadata is present.
& $tsc -p $tsconfig
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$watcher = Start-Process -FilePath $tsc -ArgumentList '-p', $tsconfig, '--watch', '--preserveWatchOutput' -PassThru -WindowStyle Hidden
try {
  & node --watch $entrypoint
  exit $LASTEXITCODE
}
finally {
  if (-not $watcher.HasExited) { Stop-Process -Id $watcher.Id -Force }
}
