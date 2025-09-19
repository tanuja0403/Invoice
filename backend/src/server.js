import path from 'path';
import fs from 'fs';
import url from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import invoiceRoutes from './routes/invoiceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Invoice from './models/Invoice.js';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const PYTHON_OCR_URL = process.env.PYTHON_OCR_URL || 'http://localhost:8000/ocr/extract';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
await mongoose.connect(process.env.MONGO_URI) 
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error(err));



// const Invoice = mongoose.model('Invoice', invoiceSchema);

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(morgan('dev'));
// app.use(express.json());
app.use(express.json({ extended: false }));
app.use('/api/invoices', invoiceRoutes);
// app.use('/api/auth', authRoutes);
app.use('/api/auth', require('./routes/auth'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/invoices', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    // Forward file to Python OCR
    const filePath = req.file.path;
    const filename = req.file.originalname;

    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    form.append('file', fileStream, filename);

    const response = await axios.post(PYTHON_OCR_URL, form, {
      headers: form.getHeaders ? form.getHeaders() : form.headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const data = response.data || {};

    // Normalize numeric amount for analytics
    const parseMoney = (val) => {
      if (val === null || val === undefined) return undefined;
      const n = parseFloat(String(val).replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? n : undefined;
    };

    const when = data.date || data.invoice_date || null;
    const dt = when ? new Date(when) : null;

    const saved = await Invoice.create({
      filename: data.filename || filename,
      vendor: data.vendor || data.merchant || null,
      date: when,
      total: data.total || data.amount_total || null,
      raw_text: data.raw_text || null,
      subtotal: data.subtotal || data.sub_total || null,
      tax: data.tax || data.vat || null,
      currency: data.currency || null,
      invoiceNumber: data.invoice_number || data.number || null,
      dueDate: data.due_date || null,
      category: data.category || null,
      amount: parseMoney(data.total || data.amount_total),
      year: dt ? dt.getUTCFullYear() : undefined,
      month: dt ? dt.getUTCMonth() + 1 : undefined,
      items: Array.isArray(data.items) ? data.items.map(i => ({
        description: i.description || i.name || null,
        quantity: typeof i.quantity === 'number' ? i.quantity : parseMoney(i.quantity) || undefined,
        unitPrice: parseMoney(i.unitPrice || i.unit_price || i.price),
        lineTotal: parseMoney(i.lineTotal || i.total)
      })) : []
    });

    res.json(saved);
  } catch (err) {
    console.error(err);
    const message = err.response?.data || err.message || 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid invoice ID" })
  
    try {
      const deleted = await Invoice.findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: "Invoice not found" })
      res.json({ message: "Invoice deleted successfully" })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Server error" })
    }
  })
  
  

app.get('/api/invoices', async (req, res) => {
  const items = await Invoice.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

// Aggregated analytics for dashboard cards and charts
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const docs = await Invoice.find().lean();
    const toNumber = (v) => {
      const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? n : 0;
    };

    const totals = {
      count: docs.length,
      amountSum: 0,
      byVendor: {},
      byMonth: {},
      byCategory: {}
    };

    for (const d of docs) {
      const amt = Number.isFinite(d.amount) ? d.amount : toNumber(d.total);
      totals.amountSum += amt;

      const vendor = d.vendor || 'Unknown';
      totals.byVendor[vendor] = (totals.byVendor[vendor] || 0) + amt;

      const keyMonth = (d.year && d.month) ? `${d.year}-${String(d.month).padStart(2, '0')}` : 'Unknown';
      totals.byMonth[keyMonth] = (totals.byMonth[keyMonth] || 0) + amt;

      const cat = d.category || 'Uncategorized';
      totals.byCategory[cat] = (totals.byCategory[cat] || 0) + amt;
    }

    res.json(totals);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});


