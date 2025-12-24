$headers = @{ "Content-Type" = "application/json" }
$baseUrl = "http://localhost:3001/api"

# 1. Login or Register
Write-Host "--- Auth Step ---"
try {
    $body = @{ email = "admin@nexus.com"; password = "Password123!" } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body $body -ErrorAction SilentlyContinue
    $token = $loginResponse.accessToken
    $userId = $loginResponse.user.id
    Write-Host "Logged in as existing user."
}
catch {
    Write-Host "Login failed, attempting register..."
    try {
        $regBody = @{ email = "admin@nexus.com"; password = "Password123!"; role = "ADMIN" } | ConvertTo-Json
        $regResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Headers $headers -Body $regBody
        
        # Login again to get token
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body $body
        $token = $loginResponse.accessToken
        $userId = $loginResponse.user.id
        Write-Host "Registered and Logged in."
    }
    catch {
        Write-Host "Auth failed completely: $_"
        exit 1
    }
}

$headers.Add("Authorization", "Bearer $token")

# 2. Seed Products
Write-Host "--- Product Step ---"
$products = @(
    @{ name = "Elite Laptop Pro"; sku = "LTP-001"; price = 1499.99; stockLevel = 45; lowStockThreshold = 10; description = "High performance laptop" },
    @{ name = "UltraWide Monitor"; sku = "MON-001"; price = 599.99; stockLevel = 5; lowStockThreshold = 8; description = "Low stock item" },
    @{ name = "Mech Keyboard"; sku = "KBD-001"; price = 129.99; stockLevel = 100; lowStockThreshold = 20; description = "Clicky" }
)

foreach ($p in $products) {
    try {
        $check = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers -ErrorAction SilentlyContinue
        $exists = $check | Where-Object { $_.sku -eq $p.sku }
        
        if (-not $exists) {
            $pBody = $p | ConvertTo-Json
            Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Post -Headers $headers -Body $pBody
            Write-Host "Created $($p.name)"
        }
        else {
            Write-Host "Product $($p.name) exists."
        }
    }
    catch {
        Write-Host "Product Error: $_"
    }
}

# 3. Seed Orders
Write-Host "--- Order Step ---"
try {
    $dbProds = Invoke-RestMethod -Uri "$baseUrl/inventory" -Method Get -Headers $headers
    $laptop = $dbProds | Where-Object { $_.sku -eq "LTP-001" }

    if ($laptop) {
        $orders = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Get -Headers $headers
        if ($orders.Count -eq 0) {
            $o1 = @{ customerName = "Alice Johnson"; items = @(@{ productId = $laptop.id; quantity = 1 }) } | ConvertTo-Json -Depth 3
            Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Headers $headers -Body $o1
            Write-Host "Created Order 1"
        }
        else {
            Write-Host "Orders already exist."
        }
    }
    else {
        Write-Host "Laptop product not found, skipping orders."
    }
}
catch {
    Write-Host "Order Error: $_"
}

# 4. Seed Notifications
Write-Host "--- Notification Step ---"
try {
    $n = @{ userId = $userId; title = "System Live"; message = "Dashboard ready."; type = "info" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Post -Headers $headers -Body $n
    Write-Host "Created Notification"
}
catch {
    Write-Host "Notification Error: $_"
}
