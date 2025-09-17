# import io
# import os
# import re
# from typing import Dict, Any, List

# from flask import Flask, request, jsonify
# from werkzeug.utils import secure_filename
# from dotenv import load_dotenv

# load_dotenv()

# APP_PORT = int(os.getenv("PORT", "8000"))
# APP_HOST = os.getenv("HOST", "0.0.0.0")

# app = Flask(__name__)

# # Lazy load EasyOCR to reduce cold start time when importing
# _easyocr_reader = None


# def get_reader():
#     global _easyocr_reader
#     if _easyocr_reader is None:
#         import easyocr  # type: ignore
#         # English by default; extend languages if needed
#         _easyocr_reader = easyocr.Reader(["en"], gpu=False)
#     return _easyocr_reader


# def read_image_bytes_from_pdf(file_stream: io.BytesIO) -> List[bytes]:
#     """Attempt to render first 1-2 pages of a PDF into images and return as bytes."""
#     try:
#         from pdf2image import convert_from_bytes  # type: ignore
#     except Exception as e:
#         raise RuntimeError(
#             "PDF support requires pdf2image and poppler to be installed on your system"
#         ) from e

#     pages = convert_from_bytes(file_stream.getvalue(), fmt="png", first_page=1, last_page=2)
#     output_images: List[bytes] = []
#     for page in pages:
#         buf = io.BytesIO()
#         page.save(buf, format="PNG")
#         output_images.append(buf.getvalue())
#     return output_images


# def extract_fields_from_text(text: str) -> Dict[str, Any]:
#     # Heuristics to find vendor (first non-empty line not resembling date/total)
#     lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

#     date_patterns = [
#         r"\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b",  # 2025-09-15
#         r"\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b",  # 09/15/2025
#         r"\b([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})\b",  # September 15, 2025
#     ]

#     money_patterns = [
#         r"\b(?:Total|Amount Due|Grand Total)[:\s]*\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)\b",
#         r"\b\$([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?)\b",
#     ]

#     found_date = None
#     for pat in date_patterns:
#         m = re.search(pat, text, flags=re.IGNORECASE)
#         if m:
#             found_date = m.group(1)
#             break

#     found_total = None
#     # Prefer lines with keywords
#     keyword_total = re.search(money_patterns[0], text, flags=re.IGNORECASE)
#     if keyword_total:
#         found_total = keyword_total.group(1)
#     else:
#         any_money = re.findall(money_patterns[1], text)
#         if any_money:
#             # pick the last amount assuming total tends to appear near the end
#             found_total = any_money[-1]

#     def looks_like_meta(line: str) -> bool:
#         if re.search(r"invoice|date|total|amount|bill|ship|tax|no\.|#", line, re.I):
#             return True
#         if re.search(r"\d", line) and re.search(r"\$|USD", line, re.I):
#             return True
#         return False

#     vendor = None
#     for ln in lines[:10]:  # look at top portion
#         if not looks_like_meta(ln):
#             vendor = ln
#             break

#     return {
#         "vendor": vendor,
#         "date": found_date,
#         "total": found_total,
#         "raw_text": text,
#     }


# @app.post("/ocr/extract")
# def ocr_extract():
#     if "file" not in request.files:
#         return jsonify({"error": "file field is required"}), 400

#     file = request.files["file"]
#     filename = secure_filename(file.filename or "uploaded")
#     content = file.read()
#     if not content:
#         return jsonify({"error": "empty file"}), 400

#     mimetype = file.mimetype or ""
#     images_bytes: List[bytes] = []

#     try:
#         if filename.lower().endswith(".pdf") or "pdf" in mimetype:
#             images_bytes = read_image_bytes_from_pdf(io.BytesIO(content))
#         else:
#             images_bytes = [content]
#     except Exception as e:
#         return jsonify({"error": f"Failed to process file: {str(e)}"}), 400

#     reader = get_reader()
#     all_text = []
#     for img_bytes in images_bytes:
#         import numpy as np  # type: ignore
#         from PIL import Image  # type: ignore

#         img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
#         np_img = np.array(img)
#         result = reader.readtext(np_img, detail=0, paragraph=True)
#         page_text = "\n".join(result)
#         all_text.append(page_text)

#     combined_text = "\n".join(all_text)
#     fields = extract_fields_from_text(combined_text)

#     return jsonify({
#         "vendor": fields.get("vendor"),
#         "date": fields.get("date"),
#         "total": fields.get("total"),
#         "raw_text": fields.get("raw_text"),
#         "filename": filename,
#     })


# @app.get("/health")
# def health():
#     return jsonify({"status": "ok"})


# if __name__ == "__main__":
#     app.run(host=APP_HOST, port=APP_PORT)


import io
import os
import re
from typing import Dict, Any, List

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

APP_PORT = int(os.getenv("PORT", "8000"))
APP_HOST = os.getenv("HOST", "0.0.0.0")

app = Flask(__name__)

_easyocr_reader = None


def get_reader():
    global _easyocr_reader
    if _easyocr_reader is None:
        import easyocr  # type: ignore
        _easyocr_reader = easyocr.Reader(["en"], gpu=False)
    return _easyocr_reader


def read_image_bytes_from_pdf(file_stream: io.BytesIO) -> List[bytes]:
    try:
        from pdf2image import convert_from_bytes  # type: ignore
    except Exception as e:
        raise RuntimeError("PDF support requires pdf2image + poppler") from e

    pages = convert_from_bytes(file_stream.getvalue(), fmt="png", first_page=1, last_page=2)
    out: List[bytes] = []
    for p in pages:
        buf = io.BytesIO()
        p.save(buf, format="PNG")
        out.append(buf.getvalue())
    return out


def extract_fields_from_text(text: str) -> Dict[str, Any]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    # Regex patterns
    date_patterns = [
        r"\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b",     # 2025-09-15
        r"\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b",   # 09/15/2025
        r"\b([A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})\b",  # September 15, 2025
    ]
    invoice_no_patterns = [
        r"(?:Invoice\s*(?:No\.?|#|Number)[:\s]*)([A-Za-z0-9\-\/]+)",
        r"(?:Bill\s*No\.?[:\s]*)([A-Za-z0-9\-\/]+)"
    ]
    money_patterns = [
        r"(?:Total|Amount\s*Due|Grand\s*Total|Net\s*Payable|Balance)[:\s]*[₹$Rs\.]*\s*([0-9,]+(?:\.\d{1,2})?)",
        r"[₹$Rs\.]\s*([0-9,]+(?:\.\d{1,2})?)",
        r"\b([0-9,]+(?:\.\d{1,2})?)\s*(INR|USD|Rs\.?|₹)\b"
    ]
    tax_patterns = [
        r"(?:Tax|GST|VAT)[:\s]*[₹$Rs\.]*\s*([0-9,]+(?:\.\d{1,2})?)"
    ]

    found_date, found_invoice, found_total, found_tax = None, None, None, None

    # Date
    for pat in date_patterns:
        m = re.search(pat, text, re.I)
        if m:
            found_date = m.group(1)
            break

    # Invoice number
    for pat in invoice_no_patterns:
        m = re.search(pat, text, re.I)
        if m:
            found_invoice = m.group(1)
            break

    # Total
    for pat in money_patterns:
        matches = re.findall(pat, text, re.I)
        if matches:
            if isinstance(matches[0], tuple):
                matches = [m[0] for m in matches]
            found_total = matches[-1]
            break

    # Tax
    for pat in tax_patterns:
        m = re.search(pat, text, re.I)
        if m:
            found_tax = m.group(1)
            break

    # Vendor → first non-meta line
    def is_meta(line: str) -> bool:
        return bool(
            re.search(r"(invoice|date|total|amount|bill|ship|tax|no\.|#|due|gst|vat)", line, re.I)
            or re.search(r"\d", line) and re.search(r"[₹$]", line)
        )

    vendor = None
    for ln in lines[:10]:
        if not is_meta(ln):
            vendor = ln
            break

    # Optional: Extract line items (very rough)
    items = []
    for ln in lines:
        if re.search(r"\d+\s+x\s+.*\d+", ln):  # e.g., 2 x ItemName 100
            items.append(ln)

    return {
        "vendor": vendor,
        "invoice_no": found_invoice,
        "date": found_date,
        "total": found_total,
        "tax": found_tax,
        "items": items if items else None,
        "raw_text": text,
    }


@app.post("/ocr/extract")
def ocr_extract():
    if "file" not in request.files:
        return jsonify({"error": "file field is required"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename or "uploaded")
    content = file.read()
    if not content:
        return jsonify({"error": "empty file"}), 400

    mimetype = file.mimetype or ""
    if filename.lower().endswith(".pdf") or "pdf" in mimetype:
        try:
            images_bytes = read_image_bytes_from_pdf(io.BytesIO(content))
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    else:
        images_bytes = [content]

    reader = get_reader()
    all_text = []
    for img_bytes in images_bytes:
        import numpy as np  # type: ignore
        from PIL import Image  # type: ignore

        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        np_img = np.array(img)
        result = reader.readtext(np_img, detail=0, paragraph=True)
        all_text.append("\n".join(result))

    combined_text = "\n".join(all_text)
    fields = extract_fields_from_text(combined_text)

    return jsonify({**fields, "filename": filename})


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host=APP_HOST, port=APP_PORT)
