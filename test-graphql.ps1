# GraphQL API Testing Script
# This script tests various GraphQL operations for the Product API

$graphqlEndpoint = "http://localhost:3000/graphql"

function Invoke-GraphQL {
    param(
        [string]$Query,
        [hashtable]$Variables = @{},
        [string]$Description = ""
    )
    
    Write-Host "`n=== $Description ===" -ForegroundColor Cyan
    Write-Host "Query:" -ForegroundColor Yellow
    Write-Host $Query
    
    if ($Variables.Count -gt 0) {
        Write-Host "Variables:" -ForegroundColor Yellow
        $Variables | ConvertTo-Json -Depth 3
    }
    
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
            Write-Host "Result:" -ForegroundColor Green
            $response.data | ConvertTo-Json -Depth 10
        }
        
        return $response
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
            Write-Host $responseBody
        }
    }
}

# Test 1: Get all products
$query1 = @"
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

Invoke-GraphQL -Query $query1 -Description "Get All Products"

# Test 2: Get products with filtering
$query2 = @"
query GetFilteredProducts(`$category: String, `$minPrice: Int, `$maxPrice: Int) {
  products(category: `$category, minPrice: `$minPrice, maxPrice: `$maxPrice) {
    id
    name
    price
    category
  }
}
"@

$variables2 = @{
    category = "electronics"
    minPrice = 500
    maxPrice = 2000
}

Invoke-GraphQL -Query $query2 -Variables $variables2 -Description "Get Filtered Products (Electronics, $500-$2000)"

# Test 3: Get single product by ID
$query3 = @"
query GetProduct(`$id: Int!) {
  product(id: `$id) {
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

$variables3 = @{
    id = 1
}

Invoke-GraphQL -Query $query3 -Variables $variables3 -Description "Get Product by ID (1)"

# Test 4: Search products
$query4 = @"
query SearchProducts(`$query: String!, `$fields: [String!]) {
  searchProducts(query: `$query, fields: `$fields) {
    id
    name
    description
    price
    category
  }
}
"@

$variables4 = @{
    query = "iPhone"
    fields = @("name", "description")
}

Invoke-GraphQL -Query $query4 -Variables $variables4 -Description "Search Products (iPhone)"

# Test 5: Get products by category
$query5 = @"
query GetProductsByCategory(`$category: String!) {
  productsByCategory(category: `$category) {
    id
    name
    price
    category
  }
}
"@

$variables5 = @{
    category = "electronics"
}

Invoke-GraphQL -Query $query5 -Variables $variables5 -Description "Get Products by Category (electronics)"

# Test 6: Get products by price range
$query6 = @"
query GetProductsByPriceRange(`$minPrice: Int!, `$maxPrice: Int!) {
  productsByPriceRange(minPrice: `$minPrice, maxPrice: `$maxPrice) {
    id
    name
    price
    category
  }
}
"@

$variables6 = @{
    minPrice = 900
    maxPrice = 1200
}

Invoke-GraphQL -Query $query6 -Variables $variables6 -Description "Get Products by Price Range ($900-$1200)"

# Test 7: Get all categories
$query7 = @"
query GetCategories {
  productCategories
}
"@

Invoke-GraphQL -Query $query7 -Description "Get All Categories"

# Test 8: Create a new product
$mutation1 = @"
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

$variables8 = @{
    input = @{
        name = "Samsung Galaxy S24"
        description = "Latest Samsung flagship smartphone"
        price = 899.99
        category = "electronics"
    }
}

Invoke-GraphQL -Query $mutation1 -Variables $variables8 -Description "Create New Product (Samsung Galaxy S24)"

# Test 9: Update a product
$mutation2 = @"
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

$variables9 = @{
    id = 2
    input = @{
        price = 1049.99
        description = "Updated iPhone 16 with new features"
    }
}

Invoke-GraphQL -Query $mutation2 -Variables $variables9 -Description "Update Product (ID: 2)"

# Test 10: Complex query with pagination and sorting
$query10 = @"
query GetProductsWithPagination(`$page: Int, `$limit: Int, `$sortBy: String, `$sortOrder: String) {
  products(page: `$page, limit: `$limit, sortBy: `$sortBy, sortOrder: `$sortOrder) {
    id
    name
    price
    category
    createdAt
  }
}
"@

$variables10 = @{
    page = 1
    limit = 5
    sortBy = "price"
    sortOrder = "desc"
}

Invoke-GraphQL -Query $query10 -Variables $variables10 -Description "Get Products with Pagination (Page 1, Limit 5, Sort by Price DESC)"

Write-Host "`n=== GraphQL Testing Complete ===" -ForegroundColor Green
Write-Host "All GraphQL operations have been tested!" -ForegroundColor Green
Write-Host "`nNote: To test subscriptions, you'll need a GraphQL client that supports WebSocket connections." -ForegroundColor Yellow
Write-Host "You can use the GraphQL Playground at http://localhost:3000/graphql for interactive testing." -ForegroundColor Yellow