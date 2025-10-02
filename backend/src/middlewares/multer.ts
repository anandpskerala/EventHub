import multer, { type FileFilterCallback } from 'multer';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '../tempUploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = [".jpg", ".jpeg", ".png", ".pdf", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and PDF files are allowed"));
    }
};

export const upload = multer({
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});