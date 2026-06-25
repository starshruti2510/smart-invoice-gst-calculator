import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import invoiceRoutes from './routes/invoiceRoutes.js'; // Routes import kiya

// Configuration load karne ke liye
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Taaki server incoming JSON data ko samajh sake

// Main API Route connect kiya
app.use('/api/invoices', invoiceRoutes);

// Ek basic test route checking ke liye
app.get('/', (req, res) => {
  res.send('GST Invoice Backend API is running perfectly!');
});

// Environment variables se port aur uri uthayenge
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoice_gst_db';

console.log('Active MONGO_URI:', MONGO_URI.replace(/:.+@/, ':***@'));

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    // Database connect hone ke baad hi server start hoga
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Database connection failed: ', err.message);
  });