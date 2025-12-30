import dotenv from "dotenv";
dotenv.config();

console.log("Starting backend...");
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
if (!process.env.DATABASE_URL) console.error("FATAL: DATABASE_URL is missing!");

import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Nexus API running on http://localhost:${port}`);
});

