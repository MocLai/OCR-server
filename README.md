# 🚀 OCR Server

> A lightweight, robust Optical Character Recognition (OCR) server built with **Express** and **Tesseract.js**. Features built-in **Swagger UI** for interactive API testing and supports packaging as a headless **Windows Portable (.exe)** application with System Tray integration.

---

## ✨ Features

* **Fast & Accurate OCR:** Powered by [Tesseract.js](https://tesseract.projectnaptha.com/) engine.
* **Flexible Base64 Input:** Automatically handles data URI headers (e.g., `data:image/png;base64,...`) as well as raw base64 strings. Automatically cleans whitespaces and trailing newline characters.
* **Character Whitelist Filters:**
  * `NUMBER_ONLY`: Extracts digits only (`0-9`).
  * `ALPHA_ONLY`: Extracts alphabetic characters only (`a-z`, `A-Z`).
  * `ALPHANUMERIC`: Extracts both letters and digits (default).
* **Interactive Swagger UI:** Built-in OpenAPI documentation available at `http://localhost:1510/api-docs`.
* **Headless Background Mode:** Packaged as an Electron `.exe` that runs 100% in the background without intrusive popup windows. Easily controlled via the Windows System Tray icon.

---

## 🛠️ Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* Operating System: Windows, macOS, or Linux (Windows required for building `.exe`)

---

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MocLai/OCR-server.git
   cd OCR-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🚦 Getting Started

### 1. Run as a Console Server (Node.js)
```bash
npm run dev
# or
node index.js
```
The server will start listening on port `1510`:
* **API Endpoint:** `http://localhost:1510/api/extract`
* **Swagger UI:** `http://localhost:1510/api-docs` (or directly `http://localhost:1510`)

### 2. Run with Electron (Development Desktop Mode)
```bash
npm start
```
Starts the server silently in the background and places an icon in the Windows System Tray.

### 3. Build Windows Portable (.exe)
```bash
npm run build:exe
```
The standalone executable will be generated inside the `dist/` directory:
```text
dist/ocr-server 1.0.0.exe
```
> **Note:** The portable `.exe` file can be transferred to any Windows machine and executed **without needing Node.js or any prerequisites installed**.

---

## 📖 API Documentation

### 📌 `POST /api/extract`
Extracts text from a base64-encoded image.

#### Request Body (`application/json`):
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `base64` | `string` | **Yes** | — | Base64-encoded image string (with or without `data:image/...;base64,` prefix) |
| `type` | `string` | No | `ALPHANUMERIC` | Character whitelist filter: `NUMBER_ONLY`, `ALPHA_ONLY`, or `ALPHANUMERIC` |

#### Request Example:
```json
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "type": "ALPHANUMERIC"
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "type": "ALPHANUMERIC",
  "text": "ABC123XYZ"
}
```

#### Error Response (`400 Bad Request`):
```json
{
  "error": "Thiếu dữ liệu base64"
}
```

---

## 💻 Code Examples

### cURL
```bash
curl -X POST http://localhost:1510/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "NUMBER_ONLY"
  }'
```

### JavaScript (`fetch`)
```javascript
const response = await fetch('http://localhost:1510/api/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    type: 'ALPHANUMERIC'
  })
});

const data = await response.json();
console.log('Extracted text:', data.text);
```

### Python (`requests`)
```python
import requests

url = "http://localhost:1510/api/extract"
payload = {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "ALPHANUMERIC"
}

res = requests.post(url, json=payload)
print("Extracted text:", res.json().get("text"))
```

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
