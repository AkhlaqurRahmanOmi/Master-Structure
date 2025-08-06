$graphqlEndpoint = "http://localhost:3000/graphql"

# Simple test query
$query = @"
query GetAllProducts {
  products {
    id
    name
    price
    category
  }
}
"@

$body = @{
    query = $query
} | ConvertTo-Json -Depth 10

Write-Host "Testing GraphQL endpoint..." -ForegroundColor Cyan
Write-Host "Query: $query" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $graphqlEndpoint -Method POST -ContentType "application/json" -Body $body
    
    if ($response.errors) {
        Write-Host "Errors:" -ForegroundColor Red
        $response.errors | ConvertTo-Json -Depth 10
    }
    
    if ($response.data) {
        Write-Host "Success!" -ForegroundColor Green
        $response.data | ConvertTo-Json -Depth 10
    }
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}