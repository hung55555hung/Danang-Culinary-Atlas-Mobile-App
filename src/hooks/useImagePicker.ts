import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useState } from 'react';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ImagePickerMode = 'single' | 'multiple';

export const useImagePicker = (mode: ImagePickerMode = 'multiple') => {
  const [images, setImages] = useState<string[]>([]); // URLs đã upload
  const [localImages, setLocalImages] = useState<string[]>([]); // URIs local để preview
  const [uploading, setUploading] = useState(false);

  const maxImages = mode === 'single' ? 1 : 10;

  const handleAddPhoto = () => {
    Alert.alert('Thêm ảnh', 'Chọn ảnh từ đâu?', [
      { text: 'Chụp ảnh', onPress: openCamera },
      { text: 'Thư viện', onPress: openGallery },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
    await handleResult(result);
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: maxImages,
    });
    await handleResult(result);
  };

  const validateImageFile = async (
    uri: string,
  ): Promise<{ valid: boolean; error?: string }> => {
    try {
      const fileStat = await RNFS.stat(uri);
      const fileSizeInMB = fileStat.size / (1024 * 1024);

      if (fileSizeInMB > 5) {
        return {
          valid: false,
          error: `Lỗi: File ảnh quá lớn (${fileSizeInMB.toFixed(
            2,
          )}MB). Tối đa 5MB`,
        };
      }

      const ext = uri.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png'];

      if (!validExtensions.includes(ext)) {
        return {
          valid: false,
          error: `Lỗi: Định dạng file không hợp lệ. Chỉ hỗ trợ: ${validExtensions.join(
            ', ',
          )}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Lỗi: Không thể kiểm tra file',
      };
    }
  };

  const handleResult = async (result: any) => {
    if (result.assets && result.assets.length > 0) {
      const newLocalImages: string[] = [];

      for (const asset of result.assets) {
        if (asset.uri) {
          const validation = await validateImageFile(asset.uri);
          if (validation.valid) {
            newLocalImages.push(asset.uri);
          } else {
            Alert.alert(
              '⚠️ Cảnh báo',
              validation.error || 'Lỗi không xác định',
            );
          }
        }
      }

      if (mode === 'single') {
        // Single mode: thay thế ảnh cũ
        setLocalImages(newLocalImages.slice(0, 1));
      } else {
        // Multiple mode: thêm vào danh sách
        setLocalImages(prev =>
          [...prev, ...newLocalImages].slice(0, maxImages),
        );
      }
    }
  };

  // Upload tất cả ảnh lên Cloudinary
  const uploadAllImages = async (): Promise<string[]> => {
    if (localImages.length === 0) {
      return [];
    }

    try {
      setUploading(true);
      const uploadPromises = localImages.map(async uri => {
        const base64 = await RNFS.readFile(uri, 'base64');
        const base64String = `data:image/jpeg;base64,${base64}`;
        return await uploadToCloudinary(base64String);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(uploadedUrls);
      return uploadedUrls;
    } catch (err) {
      Alert.alert(
        'Lỗi',
        'Không thể upload ảnh lên Cloudinary. Vui lòng thử lại.',
      );
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Upload ảnh đơn (cho profile) - trả về string thay vì array
  const uploadSingleImage = async (): Promise<string> => {
    const urls = await uploadAllImages();
    return urls[0] || '';
  };

  // Xóa ảnh theo index
  const removeImage = (index: number) => {
    setLocalImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear tất cả ảnh
  const clearImages = () => {
    setLocalImages([]);
    setImages([]);
  };

  // Set ảnh từ bên ngoài (cho trường hợp load profile hiện tại)
  const setInitialImage = (url: string) => {
    if (mode === 'single') {
      setLocalImages([url]);
    }
  };

  return {
    images,
    localImages,
    setImages,
    uploading,
    handleAddPhoto,
    uploadAllImages,
    uploadSingleImage,
    removeImage,
    clearImages,
    setInitialImage,
  };
};
