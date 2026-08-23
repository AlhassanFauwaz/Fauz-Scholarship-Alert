import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

export const uploadToCloudinary = (req, res, next) => {
  // No file? Move on
  if (!req.file) return next();

  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "soas_opportunities", timeout: 60000 },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Image upload failed", error: error.message });
        }
        req.body.image = result.secure_url;
        next();
      },
    );

    // Handle stream errors
    stream.on("error", (err) => {
      console.error("Upload stream error:", err);
      return res
        .status(500)
        .json({ message: "Image upload failed", error: err.message });
    });

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("Unexpected upload error:", err);
    return res
      .status(500)
      .json({ message: "Image upload failed", error: err.message });
  }
};

export default upload;
