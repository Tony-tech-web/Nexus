// Using native fetch (Node 18+)

const API_BASE = 'http://localhost:3001/api';

async function seed() {
    console.log('🌱 Starting seed...');

    let token = '';
    let userId = '';

    // 1. Login or Register
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@nexus.com', password: 'Password123!' })
        });

        console.log('Login Status:', loginRes.status);
        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.accessToken;
            userId = data.user.id;
            console.log('✅ Logged in.');
        } else {
            const text = await loginRes.text();
            console.log('Login response:', text);
            console.log('Login failed, registering...');
            
            const regRes = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@nexus.com', password: 'Password123!', role: 'ADMIN' })
            });
            
            console.log('Register Status:', regRes.status);
            if (!regRes.ok) {
                 const errText = await regRes.text();
                 throw new Error(`Registration failed: ${regRes.status} ${errText}`);
            }
            
            const regData = await regRes.json();
            
            // Login after register
            const loginAfterRes = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@nexus.com', password: 'Password123!' })
            });
            const data = await loginAfterRes.json();
            token = data.accessToken;
            userId = data.user.id;
            console.log('✅ Registered and Logged in.');
        }
    } catch (error) {
        console.error('❌ Auth Error:', error);
        return;
    }

    const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Seed Products
    const products = [
        { name: "Elite Laptop Pro", sku: "LTP-001", price: 1499.99, stockLevel: 45, lowStockThreshold: 10, description: "High performance laptop" },
        { name: "UltraWide Monitor", sku: "MON-001", price: 599.99, stockLevel: 5, lowStockThreshold: 8, description: "Low stock item" },
        { name: "Mech Keyboard", sku: "KBD-001", price: 129.99, stockLevel: 100, lowStockThreshold: 20, description: "Clicky" }
    ];

    console.log('📦 Seeding Products...');
    for (const p of products) {
        try {
            const res = await fetch(`${API_BASE}/inventory`, {
                method: 'POST',
                headers,
                body: JSON.stringify(p)
            });
            if (res.ok) console.log(`   Created ${p.name}`);
            else console.log(`   Failed ${p.name}: ${res.status}`);
        } catch (e) {
            console.log(`   Error ${p.name}: ${e.message}`);
        }
    }

    // 3. Seed Orders
    console.log('🛒 Seeding Orders...');
    try {
        const prodRes = await fetch(`${API_BASE}/inventory`, { headers });
        const dbProducts = await prodRes.json();
        const laptop = dbProducts.find(p => p.sku === 'LTP-001');

        if (laptop) {
            const orders = [
                { customerName: "Alice Johnson", items: [{ productId: laptop.id, quantity: 1 }] },
                { customerName: "Bob Smith", items: [{ productId: laptop.id, quantity: 2 }] }
            ];

            for (const o of orders) {
                const res = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(o)
                });
                if (res.ok) console.log(`   Created Order for ${o.customerName}`);
                else console.log(`   Failed Order: ${res.status}`);
            }
        }
    } catch (e) {
        console.error('❌ Order Error:', e);
    }

    console.log('✨ Seed Complete');
}

seed();
