const fetch = require('node-fetch'); // Assuming node-fetch is available or using native fetch in Node 18+

const API_BASE = 'http://localhost:3001/api';

async function main() {
  console.log('Starting API Seed...');

  // 1. Register/Login Admin
  let token = '';
  let user = null;

  try {
    console.log('Attempting Register...');
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123', role: 'ADMIN' })
    });
    
    if (regRes.status === 400) {
      console.log('User exists, logging in...');
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123' })
      });
      const data = await loginRes.json();
      token = data.accessToken;
      user = data.user;
    } else {
      const data = await regRes.json();
      console.log('Registered:', data);
      // Login to get token
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nexus.com', password: 'password123' })
      });
      const loginData = await loginRes.json();
      token = loginData.accessToken;
      user = loginData.user;
    }
  } catch (e) {
    console.error('Auth failed', e);
    return;
  }

  console.log('Got token:', token ? 'Yes' : 'No');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // 2. Create Products
  const products = [
    { name: 'Elite Laptop Pro', sku: 'LTP-001', price: 1499.99, stockLevel: 45, lowStockThreshold: 10, description: 'High performance' },
    { name: 'UltraWide Monitor 34"', sku: 'MON-001', price: 599.99, stockLevel: 5, lowStockThreshold: 8, description: 'Low stock item' },
    { name: 'Mechanical Keyboard', sku: 'KBD-001', price: 129.99, stockLevel: 100, lowStockThreshold: 20, description: 'Clicky' }
  ];

  for (const p of products) {
    // Try create, ignore if SKU exists (500 or 400)
    await fetch(`${API_BASE}/inventory`, {
      method: 'POST',
      headers,
      body: JSON.stringify(p)
    });
  }
  console.log('Products seeded');

  // 3. Create Orders
  // Need a product ID
  const prodRes = await fetch(`${API_BASE}/inventory`, { headers });
  const dbProducts = await prodRes.json();
  const laptop = dbProducts.find(p => p.sku === 'LTP-001');

  if (laptop) {
    await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerName: 'Alice Johnson',
        items: [{ productId: laptop.id, quantity: 1 }]
      })
    });
     await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customerName: 'Bob Smith',
        items: [{ productId: laptop.id, quantity: 2 }]
      })
    });
    console.log('Orders seeded');
  }

  // 4. Notifications
  await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: user.id,
      title: 'Welcome',
      message: 'Dashboard is live.',
      type: 'info'
    })
  });
   await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      userId: user.id,
      title: 'Stock Alert',
      message: 'Monitor is running low.',
      type: 'warning'
    })
  });
  console.log('Notifications seeded');
}

main();
