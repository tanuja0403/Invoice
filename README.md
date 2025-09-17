## Invoice Processing Full-Stack Project

This is a ready-to-run full-stack project for invoice processing with OCR.

- React frontend: file upload and dashboard with charts
- Node.js/Express backend: API, file handling, forwards files to OCR, saves to MongoDB
- Python OCR service (Flask + EasyOCR): extracts vendor name, date, and total amount

### Services and Ports
- Python OCR service: http://localhost:8000
- Node.js API: http://localhost:5000
- React frontend (Vite): http://localhost:5173

### Prerequisites
- Node.js 18+
- Python 3.9–3.11
- Git (optional)
- MongoDB (local or MongoDB Atlas connection string)

---

## Setup Instructions

### 1) Clone or copy this folder
Place it anywhere, e.g., `C:\Users\\DELL\\Desktop\\cursor\\invoice-ocr`.

### 2) Python OCR Service
```
cd python-ocr
python -m venv .venv
.\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

copy .env.example .env   (on Windows PowerShell: cp .env.example .env)
```
Edit `.env` if needed. Then run:
```
python app.py
```
It should start on http://localhost:8000

Note: The first EasyOCR/torch load may take a minute to download models.

### 3) Node.js Backend
```
cd backend
npm install

copy .env.example .env   (on Windows PowerShell: cp .env.example .env)
```
Edit `.env` with your `MONGODB_URI`. Then run:
```
npm run dev
```
It should start on http://localhost:5000

### 4) React Frontend
```
cd frontend
npm install

copy .env.example .env   (on Windows PowerShell: cp .env.example .env)
```
Edit `.env` if you changed API URL. Then run:
```
npm run dev
```
Open the URL shown (default http://localhost:5173).

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/invoices
PYTHON_OCR_URL=http://localhost:8000/ocr/extract
CLIENT_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
```

### python-ocr/.env
```
PORT=8000
HOST=0.0.0.0
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## Workflow
1. Upload an invoice PDF or image in the frontend.
2. Backend receives it, forwards to Python OCR as multipart.
3. Python OCR extracts fields and returns JSON.
4. Backend saves JSON into MongoDB.
5. Frontend dashboard fetches and displays table and charts.

---

## Troubleshooting
- If EasyOCR/torch install fails on Windows, ensure you have a supported Python version (3.9–3.11) and try upgrading pip. For CPU-only installs, provided versions in `requirements.txt` should work.
- If MongoDB connection fails, verify `MONGODB_URI` and that MongoDB is running locally or your Atlas IP is allowlisted.
- Large PDFs: OCR performance depends on CPU; consider smaller test images first.

---

## License
MIT


