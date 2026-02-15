const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// 1. Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình nơi lưu trữ (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devmanager_uploads', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'zip', 'rar'], // Cho phép cả ảnh và tài liệu
    resource_type: 'auto', // Tự động nhận diện (ảnh/video/raw file)
  },
});

const upload = multer({ storage: storage });

// 3. Controller xử lý upload
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên' });
  }
  // Trả về đường dẫn file online (Cloudinary URL)
  res.json({ url: req.file.path, filename: req.file.filename });
};

module.exports = { upload, uploadFile };