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
  params: async (req, file) => {
    // Lấy đuôi file (extension) từ tên file gốc
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    // Kiểm tra xem nó là ảnh hay tài liệu
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);

    return {
      folder: 'devmanager_uploads',
      // NẾU LÀ ẢNH -> dùng 'image'. NẾU LÀ TÀI LIỆU (pdf, docx, zip...) -> dùng 'raw'
      resource_type: isImage ? 'image' : 'raw', 
    };
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