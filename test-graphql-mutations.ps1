# GraphQL Mutations Testing Script
$graphqlEndpoint = "http://localhost:3000/graphql"

function Invoke-GraphQL {
    param(
        [string]$Query,
        [hashtable]$Variables = @{},
        [string]$Description = ""
    )
    
    Write-Host "`n=== $Description ===" -ForegroundColor Cyan
    
    $body = @{
        query = $Query
        variables = $Variables
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri $graphqlEndpoint -Method POST -ContentType "application/json" -Body $body
        
        if ($response.errors) {
            Write-Host "Errors:" -ForegroundColor Red
            $response.errors | ConvertTo-Json -Depth 10
        }
        
        if ($response.data) {
            Write-Host "Success:" -ForegroundColor Green
            $response.data | ConvertTo-Json -Depth 10
        }
        
        return $response
    } catch {
        Write-Host "Error:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

# Test 1: Create a unique product
$createMutation = @"
mutation CreateProduct(`$input: CreateProductInput!) {
  createProduct(createProductInput: `$input) {
    id
    name
    description
    price
    category
    createdAt
  }
}
"@

$createVariables = @{
    input = @{
        name = "MacBook Pro M3"
        description = "Latest MacBook Pro with M3 chip and 16GB RAM"
        price = 2499.99
        category = "electronics"
    }
}

$createResult = Invoke-GraphQL -Query $createMutation -Variables $createVariables -Description "Create MacBook Pro M3"

# Test 2: Update the created product (if successful)
if ($createResult.data -and $createResult.data.createProduct) {
    $productId = $createResult.data.createProduct.id
    
    $updateMutation = @"
mutation UpdateProduct(`$id: Int!, `$input: UpdateProductInput!) {
  updateProduct(id: `$id, updateProductInput: `$input) {
    id
    name
    description
    price
    category
    updatedAt
  }
}
"@

    $updateVariables = @{
        id = $productId
        input = @{
            price = 2299.99
            description = "MacBook Pro M3 - Special discount price!"
        }
    }

    Invoke-GraphQL -Query $updateMutation -Variables $updateVariables -Description "Update MacBook Pro M3 Price"
}

# Test 3: Create another product
$createMutation2 = @"
mutation CreateProduct(`$input: CreateProductInput!) {
  createProduct(createProductInput: `$input) {
    id
    name
    description
    price
    category
  }
}
"@

$createVariables2 = @{
    input = @{
        name = "AirPods Pro 2"
        description = "Wireless earbuds with active noise cancellation"
        price = 249.99
        category = "electronics"
    }
}

Invoke-GraphQL -Query $createMutation2 -Variables $createVariables2 -Description "Create AirPods Pro 2"

# Test 4: Query all products to see our new additions
$queryAll = @"
query GetAllProducts {
  products(sortBy: "createdAt", sortOrder: "desc") {
    id
    name
    price
    category
    createdAt
  }
}
"@

Invoke-GraphQL -Query $queryAll -Description "Get All Products (Sorted by Creation Date)"

# Test 5: Search for our new products
$searchQuery = @"
query SearchProducts(`$query: String!) {
  searchProducts(query: `$query) {
    id
    name
    description
    price
  }
}
"@

$searchVariables = @{
    query = "MacBook"
}

Invoke-GraphQL -Query $searchQuery -Variables $searchVariables -Description "Search for MacBook Products"

Write-Host "`n=== GraphQL Mutations Testing Complete ===" -ForegroundColor Green