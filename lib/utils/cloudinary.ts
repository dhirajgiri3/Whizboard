import { v2 as cloudinary } from 'cloudinary';
import '@/lib/env';

// Configure via CLOUDINARY_URL env automatically; fallback to explicit config if needed
// Example CLOUDINARY_URL: cloudinary://<api_key>:<api_secret>@<cloud_name>
if (!process.env.CLOUDINARY_URL) {
  console.warn('[cloudinary] CLOUDINARY_URL is not set. Uploads will fail.');
}

cloudinary.config({
  secure: true,
});

export default cloudinary;


