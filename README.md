# 🚀 OCR Server

> Server nhận diện ký tự quang học (OCR) từ hình ảnh Base64 xây dựng trên nền tảng **Express** và **Tesseract.js**, tích hợp sẵn **Swagger UI** để kiểm thử trực quan và hỗ trợ đóng gói thành ứng dụng **Windows Portable (.exe)** chạy ngầm trên khay hệ thống.

---

## ✨ Tính năng nổi bật

* **Nhận diện ký tự nhanh chóng:** Sử dụng engine OCR mạnh mẽ từ [Tesseract.js](https://tesseract.projectnaptha.com/).
* **Hỗ trợ Base64 linh hoạt:** Tự động nhận diện cả ảnh có tiền tố (`data:image/png;base64,...`) và chuỗi Base64 thuần túy (raw base64). Tự động lọc khoảng trắng và ký tự xuống dòng thừa.
* **Bộ lọc ký tự đa dạng:**
  * `NUMBER_ONLY`: Chỉ nhận diện chữ số (`0-9`).
  * `ALPHA_ONLY`: Chỉ nhận diện chữ cái (`a-z`, `A-Z`).
  * `ALPHANUMERIC`: Nhận diện cả chữ và số (mặc định).
* **Giao diện Swagger UI trực quan:** Dễ dàng kiểm thử API trực tiếp tại `http://localhost:1510/api-docs`.
* **Chạy ngầm khay hệ thống (System Tray):** Khi đóng gói thành file `.exe`, ứng dụng chạy ngầm 100% không bật cửa sổ giao diện, hiển thị icon tại khay hệ thống cạnh đồng hồ Windows để tiện theo dõi và mở Swagger.

---

## 🛠️ Yêu cầu môi trường

* [Node.js](https://nodejs.org/) version 18 trở lên (nếu chạy từ mã nguồn).
* Hệ điều hành: Windows, macOS hoặc Linux.

---

## 📦 Cài đặt

1. Clone mã nguồn về máy:
   ```bash
   git clone https://github.com/MocLai/OCR-server.git
   cd OCR-server
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

---

## 🚦 Hướng dẫn sử dụng

### 1. Khởi chạy bằng Node.js (Chế độ Console Server)
```bash
npm run dev
# hoặc
node index.js
```
Server sẽ lắng nghe tại cổng `1510`:
* **API Endpoint:** `http://localhost:1510/api/extract`
* **Swagger UI:** `http://localhost:1510/api-docs` (hoặc truy cập thẳng `http://localhost:1510`)

### 2. Khởi chạy bằng Electron (Môi trường Dev Desktop)
```bash
npm start
```
Ứng dụng sẽ chạy ngầm và tạo một biểu tượng ở khay hệ thống (System Tray).

### 3. Đóng gói thành file `.exe` (Windows Portable)
```bash
npm run build:exe
```
Sau khi build xong, file chạy độc lập sẽ nằm trong thư mục `dist/`:
```text
dist/ocr-server 1.0.0.exe
```
> Bạn có thể copy file `.exe` này sang bất kỳ máy tính Windows nào khác để chạy ngay mà **không cần cài đặt Node.js hay bất cứ công cụ nào**.

---

## 📖 Tài liệu API

### 📌 `POST /api/extract`
Trích xuất văn bản từ hình ảnh Base64.

#### Request Body (`application/json`):
| Tham số | Kiểu dữ liệu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `base64` | `string` | **Có** | — | Chuỗi Base64 của ảnh (có hoặc không có header `data:image/...;base64,`) |
| `type` | `string` | Không | `ALPHANUMERIC` | Bộ lọc ký tự: `NUMBER_ONLY`, `ALPHA_ONLY`, `ALPHANUMERIC` |

#### Request Example:
```json
{
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "type": "ALPHANUMERIC"
}
```

#### Response Example (Thành công - `200 OK`):
```json
{
  "success": true,
  "type": "ALPHANUMERIC",
  "text": "ABC123XYZ"
}
```

#### Response Example (Lỗi - `400 Bad Request`):
```json
{
  "error": "Thiếu dữ liệu base64"
}
```

---

## 💻 Ví dụ gọi API

### Sử dụng cURL:
```bash
curl -X POST http://localhost:1510/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "NUMBER_ONLY"
  }'
```

### Sử dụng JavaScript (`fetch`):
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
console.log('Văn bản nhận diện được:', data.text);
```

### Sử dụng Python (`requests`):
```python
import requests

url = "http://localhost:1510/api/extract"
payload = {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "ALPHANUMERIC"
}

res = requests.post(url, json=payload)
print("Kết quả:", res.json().get("text"))
```

---

## 📄 License
Dự án được phân phối dưới giấy phép [ISC](LICENSE).
