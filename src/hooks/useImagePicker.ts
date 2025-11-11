// import { Alert } from 'react-native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import RNFS from 'react-native-fs';
// import { useState } from 'react';
// import { uploadToCloudinary } from '../utils/uploadToCloudinary';

// export const useImagePicker = () => {
//   const [images, setImages] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);

//   const handleAddPhoto = () => {
//     Alert.alert('Thêm ảnh', 'Chọn ảnh từ đâu?', [
//       { text: 'Chụp ảnh', onPress: openCamera },
//       { text: 'Thư viện', onPress: openGallery },
//       { text: 'Hủy', style: 'cancel' },
//     ]);
//   };

//   const openCamera = async () => {
//     const result = await launchCamera({ mediaType: 'photo', quality: 0.8 });
//     await handleResult(result);
//   };

//   const openGallery = async () => {
//     const result = await launchImageLibrary({ mediaType: 'photo' });
//     await handleResult(result);
//   };

//   const handleResult = async (result: any) => {
//     if (result.assets && result.assets[0].uri) {
//       const uri = result.assets[0].uri;
//       const base64 = await RNFS.readFile(uri, 'base64');
//       const base64String = `data:image/jpeg;base64,${base64}`;
//       try {
//         setUploading(true);
//         const uploadedUrl = await uploadToCloudinary(base64String);
//         setImages(prev => [...prev, uploadedUrl]);
//       } catch (err) {
//         Alert.alert('Lỗi', 'Không thể upload ảnh lên Cloudinary');
//       } finally {
//         setUploading(false);
//       }
//     }
//   };

//   return {
//     images,
//     setImages,
//     uploading,
//     handleAddPhoto,
//   };
// };

import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useState } from 'react';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];

export const useImagePicker = () => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

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
      mediaType: 'mixed', // <-- cho phép chọn cả ảnh và video
      selectionLimit: 1, // hoặc 0 nếu muốn chọn nhiều
    });

    if (result.didCancel) return;
    await handleResult(result);
  };

  // ✅ Validate file trước upload
  const validateImageFile = async (
    uri: string,
  ): Promise<{ valid: boolean; error?: string }> => {
    try {
      // Get file size
      const fileStat = await RNFS.stat(uri);
      const fileSizeInMB = fileStat.size / (1024 * 1024);

      // Check file size
      if (fileSizeInMB > 5) {
        return {
          valid: false,
          error: `❌ Lỗi: File ảnh quá lớn (${fileSizeInMB.toFixed(
            2,
          )}MB). Tối đa 5MB`,
        };
      }

      // Get file extension
      const ext = uri.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png'];

      if (!validExtensions.includes(ext)) {
        return {
          valid: false,
          error: `❌ Lỗi: Định dạng file không hợp lệ. Chỉ hỗ trợ: ${validExtensions.join(
            ', ',
          )}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: '❌ Lỗi: Không thể kiểm tra file',
      };
    }
  };

  const handleResult = async (result: any) => {
    if (result.assets && result.assets[0].uri) {
      const uri = result.assets[0].uri;

      // ✅ Validate file
      const validation = await validateImageFile(uri);
      if (!validation.valid) {
        Alert.alert('⚠️ Cảnh báo', validation.error || 'Lỗi không xác định');
        return;
      }

      try {
        const base64 = await RNFS.readFile(uri, 'base64');
        const base64String = `data:image/jpeg;base64,${base64}`;

        setUploading(true);
        const uploadedUrl = await uploadToCloudinary(base64String);
        setImages(prev => [...prev, uploadedUrl]);
        Alert.alert('✅ Thành công', 'Ảnh đã được upload');
      } catch (err) {
        Alert.alert(
          '❌ Lỗi',
          'Không thể upload ảnh lên Cloudinary. Vui lòng thử lại.',
        );
      } finally {
        setUploading(false);
      }
    }
  };

  return {
    images,
    setImages,
    uploading,
    handleAddPhoto,
  };
};
