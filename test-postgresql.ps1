# Test PostgreSQL connection with both REST and GraphQL
$restEndpoint = "http://localhost:3000/api/v1/products"
$graphqlEndpoint = "http://localhost:3000/graphql"

Write-Host "=== Testing PostgreSQL Connection ===" -ForegroundColor Cyan

# Test 1: Create a product via REST API
Write-Host "`n1. Testing REST API - Create Product" -ForegroundColor Yellow
$restBody = @{
    name = "MacBook Pro M3 PostgreSQL Test"
    description = "Testing PostgreSQL connection with REST API"
    price = 2499.99
    category = "electronics"
} | ConvertTo-Json

try {
    $restResponse = Invoke-RestMethod -Uri $restEndpoint -Method POST -ContentType "application/json" -Body $restBody
    Write-Host "REST Create Success:" -ForegroundColor Green
    $restResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "REST Create Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Get products via REST API
Write-Host "`n2. Testing REST API - Get Products" -ForegroundColor Yellow
try {
    $restGetResponse = Invoke-RestMethod -Uri $restEndpoint -Method GET
    Write-Host "REST Get Success:" -ForegroundColor Green
    $restGetResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "REST Get Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 3: Create a product via GraphQL
Write-Host "`n3. Testing GraphQL - Create Product" -ForegroundColor Yellow
$graphqlCreateQuery = @"
mutation CreateProduct(`$input: CreateProductInput!) {
  createProduct(createProductInput: `$input) {
    id
    name
    description
    price
    category
    createdAt
    updatedAt
  }
}
"@

$graphqlCreateBody = @{
    query = $graphqlCreateQuery
    variables = @{
        input = @{
            name = "iPhone 15 PostgreSQL Test"
            description = "Testing PostgreSQL connection with GraphQL"
            price = 999.99
            category = "electronics"
        }
    }
} | ConvertTo-Json -Depth 10

try {
    $graphqlCreateResponse = Invoke-RestMethod -Uri $graphqlEndpoint -Method POST -ContentType "application/json" -Body $graphqlCreateBody
    
    if ($graphqlCreateResponse.errors) {
        Write-Host "GraphQL Create Errors:" -ForegroundColor Red
        $graphqlCreateResponse.errors | ConvertTo-Json -Depth 10
    } else {
        Write-Host "GraphQL Create Success:" -ForegroundColor Green
        $graphqlCreateResponse.data | ConvertTo-Json -Depth 10
    }
} catch {
    Write-Host "GraphQL Create Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 4: Get products via GraphQL
Write-Host "`n4. Testing GraphQL - Get Products" -ForegroundColor Yellow
$graphqlGetQuery = @"
query GetAllProducts {
  products {
    id
    name
    description
    price
    category
    createdAt
    updatedAt
  }
}
"@

$graphqlGetBody = @{
    query = $graphqlGetQuery
} | ConvertTo-Json -Depth 10

try {
    $graphqlGetResponse = Invoke-RestMethod -Uri $graphqlEndpoint -Method POST -ContentType "application/json" -Body $graphqlGetBody
    
    if ($graphqlGetResponse.errors) {
        Write-Host "GraphQL Get Errors:" -ForegroundColor Red
        $graphqlGetResponse.errors | ConvertTo-Json -Depth 10
    } else {
        Write-Host "GraphQL Get Success:" -ForegroundColor Green
        $graphqlGetResponse.data | ConvertTo-Json -Depth 10
    }
} catch {
    Write-Host "GraphQL Get Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n=== PostgreSQL Testing Complete ===" -ForegroundColor Green