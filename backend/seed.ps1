$headers = @{ "Content-Type" = "application/json" }
$baseUrl = "http://localhost:3001/api"

# 1. Register Admin
Write-Host "Registering admin..."
try {
    $body = @{ email = "admin@nexus.com"; password = "Password123!"; role = "ADMIN" } | ConvertTo-Json
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "Registered: $($regResponse.user.email)"
} catch {
    Write-Host "User likely exists, proceeding to login..."
}

# 2. Login
Write-Host "Logging in..."
$body = @{ email = "admin@nexus.com"; password = "Password123!" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body $body
$token = $loginResponse.accessToken
$headers.Add("Authorization", "Bearer $token")
Write-Host "Logged in. Token acquired."

# 3. Create Products
Write-Host "Creating products..."
$products = @(
    @{ name = "Elite Laptop Pro"; sku = "LTP-001"; price = 1499.99; stockLevel = 45; lowStockThreshold = 10; description = "High perf laptop" },
    @{ name = "UltraWide Monitor"; sku = "MON-001"; price = 599.99; stockLevel = 5; lowStockThreshold = 8; description = "Low stock item" },
    @{ name = "Mech Keyboard"; sku = "KBD-001"; price = 129.99; stockLevel = 100; lowStockThreshold = 20; description = "Clicky" }
)

foreach ($p in $products) {
    try {
        $pBody = $p | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Post -Headers $headers -Body $pBody
    } catch { Write-Host "Product $($p.sku) exists or failed" }
}

# 4. Create Orders
Write-Host "Creating orders..."
try {
    # Get products for IDs
    $dbProds = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    $laptop = $dbProds | Where-Object { $_.sku -eq "LTP-001" }
    
    if ($laptop) {
        $o1 = @{ customerName = "Alice Johnson"; items = @(@{ productId = $laptop.id; quantity = 1 })} | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body $o1
        
        $o2 = @{ customerName = "Bob Smith"; items = @(@{ productId = $laptop.id; quantity = 2 })} | ConvertTo-Json -Depth 3
        Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body $o2
    }
} catch { Write-Host "Order creation failed: $_" }

# 5. Create Notifications
Write-Host "Creating notifications..."
try {
    $uid = $loginResponse.user.id
    $n1 = @{ userId = $uid; title = "System Live"; message = "Dashboard ready."; type = "info" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Post -Headers $headers -Body $n1
    
    $n2 = @{ userId = $uid; title = "Stock Alert"; message = "Monitor low stock."; type = "warning" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Post -Headers $headers -Body $n2
} catch { Write-Host "Notification failed: $_" }

Write-Host "Seeding Complete!"
