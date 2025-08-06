$body = @{
    name = "iPhone 15"
    description = "Latest iPhone"
    price = 999.99
    category = "electronics"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/products" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Success:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        Write-Host "Response Body:" -ForegroundColor Yellow
        try {
            $errorObj = $responseBody | ConvertFrom-Json
            $errorObj | ConvertTo-Json -Depth 10
        } catch {
            Write-Host $responseBody
        }
    }
}