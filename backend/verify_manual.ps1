$headers = @{ "Content-Type" = "application/json" }
$baseUrl = "http://127.0.0.1:3001/api"

try {
    Write-Host "1. Logging in..."
    $body = @{ email = "admin@nexus.com"; password = "Password123!" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body $body
    $token = $loginRes.accessToken
    Write-Host "   Token acquired."
    $headers.Add("Authorization", "Bearer $token")

    Write-Host "2. Creating Product..."
    $p = @{ name = "Test Laptop"; sku = "TEST-001"; price = 999.99; stockLevel = 10; lowStockThreshold = 2; description = "Manual Seed" } | ConvertTo-Json
    $prodRes = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Post -Headers $headers -Body $p
    Write-Host "   Product Created: $($prodRes.name)"

    Write-Host "3. Verifying Inventory..."
    $list = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    Write-Host "   Found $($list.Count) products."

    Write-Host "4. Checking Users..."
    $users = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Get -Headers $headers
    Write-Host "   Found $($users.Count) users."

}
catch {
    Write-Host "Error: $_"
    exit 1
}
