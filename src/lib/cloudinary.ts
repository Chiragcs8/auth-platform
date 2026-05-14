import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  userId: string,
  mimeType: string
): Promise<string> {
  const folder = `auth-platform/profiles`;
  const publicId = `profile_${userId}`;

  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${buffer.toString('base64')}`,
    {
      public_id: publicId,
      folder,
      overwrite: true, // Replace existing image on re-upload
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
    }
  );

  return result.secure_url;
}

/**
 * Delete a profile image from Cloudinary by user ID.
 */
export async function deleteFromCloudinary(userId: string): Promise<void> {
  const publicId = `auth-platform/profiles/profile_${userId}`;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Image may not exist in Cloudinary (e.g., user never uploaded one)
    // Silently ignore deletion errors
  }
}

export { cloudinary };