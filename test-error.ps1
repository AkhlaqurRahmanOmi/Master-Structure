$body = '{"name": "iPhone 15", "description": "Latest iPhone", "price": 999.99, "category": "electronics"}'

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/products" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Success:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error Status Code:" $_.Exception.Response.StatusCode -ForegroundColor Red
    Write-Host "Error Response:" -ForegroundColor Yellow
    $errorStream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorStream)
    $errorBody = $reader.ReadToEnd()
    $reader.Close()
    $errorStream.Close()
    
    try {
        $errorObj = $errorBody | ConvertFrom-Json
        $errorObj | ConvertTo-Json -Depth 10
    } catch {
        Write-Host $errorBody
    }
}