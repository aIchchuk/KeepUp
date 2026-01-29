import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure base directory exists
const baseDir = "public/images";
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We can pass the directory via req.uploadType or use the route path
        const subDir = req.uploadPath || "misc";
        const uploadPath = path.join(baseDir, subDir);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user._id || 'guest'}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Only image files (jpg, jpeg, png, webp) are allowed!"));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter
});

export const uploadTo = (folderName) => {
    return (req, res, next) => {
        req.uploadPath = folderName;
        next();
    };
};

export default upload;
