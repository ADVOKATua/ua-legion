$ErrorActionPreference = 'Stop'
$root = (Get-Location).Path
if (-not (Test-Path (Join-Path $root 'ets2-info.html'))) {
  throw 'Запустіть скрипт із кореня репозиторію ua-legion.'
}
Get-ChildItem -Path $root -Filter '*.html' -File | ForEach-Object {
  if ($_.Name -eq 'ets2.html') { return }
  $p = $_.FullName
  $s = Get-Content -LiteralPath $p -Raw -Encoding UTF8
  # Remove the ETS2 home navigation item, wherever it appears.
  $s = [regex]::Replace($s, '<a\b(?=[^>]*href=["'']ets2\.html["''])[^>]*>\s*🏠\s*Головна ETS2\s*</a>', '', 'IgnoreCase')
  # The former ETS2 home page is removed; any remaining link to it now opens info.
  $s = $s.Replace('href="ets2.html"', 'href="ets2-info.html"').Replace("href='ets2.html'", "href='ets2-info.html'")
  if ($s -ne (Get-Content -LiteralPath $p -Raw -Encoding UTF8)) {
    Set-Content -LiteralPath $p -Value $s -Encoding UTF8 -NoNewline
    Write-Host "Updated $($_.Name)"
  }
}
$home = Join-Path $root 'ets2.html'
if (Test-Path $home) {
  Remove-Item -LiteralPath $home
  Write-Host 'Deleted ets2.html'
}
Write-Host 'Done. Review changes before committing.'
