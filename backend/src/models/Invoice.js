import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    filename: { type: String },
    vendor: { type: String },
    date: { type: String },
    total: { type: String },
    raw_text: { type: String }
  },
  { timestamps: true }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
