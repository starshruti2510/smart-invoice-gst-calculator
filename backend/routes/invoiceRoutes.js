import express from 'express';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// 1. Naya Invoice create aur GST calculate karne ke liye API
router.post('/', async (req, res) => {
  try {
    const { invoiceNumber, clientName, transactionType, items } = req.body;

    let totalTaxableAmount = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const calculatedItems = items.map(item => {
      const taxableValue = item.price * item.quantity;
      let cgst = 0, sgst = 0, igst = 0;

      if (transactionType === 'Intra-State') {
        cgst = taxableValue * (item.gstRate / 200); // 18% ka aadha 9% CGST
        sgst = taxableValue * (item.gstRate / 200); // 9% SGST
      } else {
        igst = taxableValue * (item.gstRate / 100); // Poora 18% IGST
      }

      const totalAmount = taxableValue + cgst + sgst + igst;

      totalTaxableAmount += taxableValue;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;

      return { ...item, taxableValue, cgst, sgst, igst, totalAmount };
    });

    const grandTotal = totalTaxableAmount + totalCGST + totalSGST + totalIGST;

    const newInvoice = new Invoice({
      invoiceNumber,
      clientName,
      transactionType,
      items: calculatedItems,
      totalTaxableAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      grandTotal
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Saare saved invoices fetch karne ke liye API
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;