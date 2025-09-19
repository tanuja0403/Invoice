import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    filename: { type: String },
    vendor: { type: String },
    date: { type: String },
    total: { type: String },
    raw_text: { type: String },
    subtotal: { type: String },
    tax: { type: String },
    currency: { type: String },
    invoiceNumber: { type: String },
    dueDate: { type: String },
    category: { type: String },
    // Numeric helpers for analytics
    amount: { type: Number },
    year: { type: Number },
    month: { type: Number }, // 1-12
    // Optional line items if OCR provides them
    items: [
      {
        description: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
        lineTotal: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
