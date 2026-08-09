$ErrorActionPreference = "Stop"
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "app"))
$server = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8";
  ".mjs"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json; charset=utf-8"; ".webmanifest"="application/manifest+json";
  ".svg"="image/svg+xml"; ".png"="image/png"; ".woff2"="font/woff2";
  ".wasm"="application/wasm"; ".zip"="application/zip"
}

try {
  $server.Start()
  $port = ([Net.IPEndPoint]$server.LocalEndpoint).Port
  $url = "http://127.0.0.1:$port/"
  Write-Host "Python Academy Offline is running at $url" -ForegroundColor Green
  Write-Host "Keep this window open. Press Ctrl+C to stop." -ForegroundColor Yellow
  Start-Process $url

  while ($true) {
    $client = $server.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()
      if (-not $requestLine) { continue }
      do { $headerLine = $reader.ReadLine() } while ($headerLine -ne $null -and $headerLine -ne "")
      $requestTarget = ($requestLine -split " ")[1]
      $requestPath = [Uri]::UnescapeDataString(($requestTarget -split "\?")[0])
      if ($requestPath -eq "/") { $requestPath = "/index.html" }
      $relative = $requestPath.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
      $filePath = [IO.Path]::GetFullPath((Join-Path $root $relative))
      $allowed = $filePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)

      if (-not $allowed -or -not [IO.File]::Exists($filePath)) {
        $body = [Text.Encoding]::UTF8.GetBytes("Not Found")
        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      } else {
        $body = [IO.File]::ReadAllBytes($filePath)
        $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $contentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { "application/octet-stream" }
        $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      }
      $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($body, 0, $body.Length)
      $stream.Flush()
    } finally {
      $client.Close()
    }
  }
} finally {
  $server.Stop()
}
