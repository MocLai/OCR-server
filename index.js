const express = require('express');
const cors = require('cors');
const { createWorker } = require('tesseract.js');
const swaggerUi = require('swagger-ui-express');

// Phát hiện môi trường Electron
let electronApp = null;
let Tray = null;
let Menu = null;
let nativeImage = null;
let shell = null;

try {
  const electron = require('electron');
  if (electron && typeof electron === 'object' && electron.app) {
    electronApp = electron.app;
    Tray = electron.Tray;
    Menu = electron.Menu;
    nativeImage = electron.nativeImage;
    shell = electron.shell;
  }
} catch {
  // Chạy bằng Node thông thường
}

const server = express();
const PORT = 1510;

server.use(cors());
server.use(express.json({ limit: '50mb' }));

// ─── OpenAPI / Swagger Document ───────────────────────────────────────────────
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'OCR Server API',
    version: '1.0.0',
    description: 'API nhận diện ký tự từ ảnh base64 sử dụng Tesseract.js OCR engine.',
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    '/api/extract': {
      post: {
        summary: 'Trích xuất văn bản từ ảnh base64',
        description: 'Nhận ảnh dạng chuỗi base64 và trả về văn bản nhận diện được.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['base64'],
                properties: {
                  base64: {
                    type: 'string',
                    description: 'Chuỗi base64 của ảnh (hỗ trợ cả header data:image/...)',
                    example: 'data:image/png;base64,iVBORw0KGgo...',
                  },
                  type: {
                    type: 'string',
                    enum: ['NUMBER_ONLY', 'ALPHA_ONLY', 'ALPHANUMERIC'],
                    default: 'ALPHANUMERIC',
                    description: 'Bộ lọc ký tự: chỉ số, chỉ chữ, hoặc cả chữ và số.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Nhận diện thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    type: { type: 'string', example: 'ALPHANUMERIC' },
                    text: { type: 'string', example: 'ABC123' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Thiếu dữ liệu base64 trong body',
          },
          '500': {
            description: 'Lỗi trong quá trình xử lý OCR',
          },
        },
      },
    },
  },
};

// Cấu hình Swagger UI
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));
server.get('/', (_req, res) => res.redirect('/api-docs'));

// ─── OCR Engine Setup ─────────────────────────────────────────────────────────
const CHAR_WHITELIST = {
  NUMBER_ONLY: '0123456789',
  ALPHA_ONLY: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ALPHANUMERIC: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

let worker = null;
let isWorkerReady = false;

async function initWorker() {
  try {
    worker = await createWorker('eng');
    isWorkerReady = true;
    console.log('✅ OCR Worker đã sẵn sàng!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo OCR Worker:', err);
  }
}

server.post('/api/extract', async (req, res) => {
  try {
    if (!isWorkerReady || !worker) {
      return res.status(503).json({ error: 'OCR Worker đang khởi động, vui lòng thử lại sau vài giây' });
    }

    const { base64, type = 'ALPHANUMERIC' } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu base64' });
    }

    // Tự động nhận diện: có tiền tố data:image/...;base64, hoặc base64 thuần không có tiền tố
    const cleanBase64 = String(base64)
      .trim()
      .replace(/^data:[^;]+;base64,/i, '')
      .replace(/\s+/g, '');

    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu base64 không hợp lệ hoặc ảnh rỗng' });
    }

    const whitelist = CHAR_WHITELIST[type] || CHAR_WHITELIST.ALPHANUMERIC;
    await worker.setParameters({
      tessedit_char_whitelist: whitelist,
      tessedit_pageseg_mode: '6',
    });

    const { data: { text } } = await worker.recognize(imageBuffer);
    return res.json({ success: true, type, text: text.trim() });
  } catch (error) {
    console.error('Lỗi nhận diện:', error);
    return res.status(500).json({ error: error.message });
  }
});

function startServer() {
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🚀 OCR Server đang chạy ngầm tại: http://localhost:${PORT}`);
      console.log(`📄 Swagger UI:                      http://localhost:${PORT}/api-docs`);
      resolve();
    });
  });
}

// ─── Khởi chạy ứng dụng ───────────────────────────────────────────────────────
let tray = null;

if (electronApp) {
  // Chạy ngầm 100% không mở cửa sổ giao diện
  electronApp.whenReady().then(async () => {
    await startServer();
    initWorker();

    // Icon chấm xanh 16x16 hiển thị dưới khay hệ thống (System Tray cạnh đồng hồ)
    const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAExJREFUOE9jZKAQMFKon2HUAAYGBoa/DAwM/0E0mYCRoT8Y6A74zwjj41M7CkaDYDSAcTRgYGB4wMDA8I+BgeEfmU4YDYIRGAYAEu0NAhS8mTYAAAAASUVORK5CYII=';
    const icon = nativeImage.createFromDataURL('data:image/png;base64,' + iconBase64);

    tray = new Tray(icon);
    tray.setToolTip(`OCR Server`);

    const contextMenu = Menu.buildFromTemplate([
      { label: `🟢 OCR Server đang chạy (Port ${PORT})`, enabled: false },
      { type: 'separator' },
      {
        label: '📖 Mở Swagger UI trên trình duyệt',
        click: () => {
          if (shell) shell.openExternal(`http://localhost:${PORT}/api-docs`);
        },
      },
      { type: 'separator' },
      {
        label: '❌ Thoát OCR Server',
        click: () => {
          electronApp.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);

    // Nhấp đúp vào icon dưới khay hệ thống để mở thẳng Swagger UI
    tray.on('double-click', () => {
      if (shell) shell.openExternal(`http://localhost:${PORT}/api-docs`);
    });
  });

  // Đảm bảo app không tự tắt khi không có cửa sổ giao diện
  electronApp.on('window-all-closed', (e) => {
    e.preventDefault();
  });
} else {
  // Chạy bằng Node thông thường (node index.js)
  (async () => {
    await startServer();
    initWorker();
  })();
}
