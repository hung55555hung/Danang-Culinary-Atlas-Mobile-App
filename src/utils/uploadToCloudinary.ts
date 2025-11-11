import { CLOUDINARY_URL, UPLOAD_PRESET } from './cloudinaryConfig';

export const uploadToCloudinary = async (
  base64Image: string,
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url; // URL ảnh online
    } else {
      throw new Error('Upload failed: ' + JSON.stringify(data));
    }
  } catch (err) {
    console.error('Lỗi upload Cloudinary:', err);
    throw err;
  }
};
