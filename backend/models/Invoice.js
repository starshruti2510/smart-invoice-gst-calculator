import mongoose from 'mongoose';

const invoiceItemSchema = mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  gstRate: { type: Number, required: true }, // 0, 5, 12, 18, 28
  taxableValue: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }
});

const invoiceSchema = mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transactionType: { type: String, enum: ['Intra-State', 'Inter-State'], required: true },
  items: [invoiceItemSchema],
  totalTaxableAmount: { type: Number, required: true },
  totalCGST: { type: Number, default: 0 },
  totalSGST: { type: Number, default: 0 },
  totalIGST: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;