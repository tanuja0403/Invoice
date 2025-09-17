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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/invoice';
await mongoose.connect("mongodb+srv://tanuja1234:tanuja1234@devconnector.yyb8nkr.mongodb.net/invoice");

const invoiceSchema = new mongoose.Schema(
  {
    filename: String,
    vendor: String,
    date: String,
    total: String,
    raw_text: String
  },
  { timestamps: true }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json());

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

    const saved = await Invoice.create({
      filename: data.filename || filename,
      vendor: data.vendor || null,
      date: data.date || null,
      total: data.total || null,
      raw_text: data.raw_text || null
    });

    res.json(saved);
  } catch (err) {
    console.error(err);
    const message = err.response?.data || err.message || 'Unknown error';
    res.status(500).json({ error: message });
  }
});

app.get('/api/invoices', async (req, res) => {
  const items = await Invoice.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});


