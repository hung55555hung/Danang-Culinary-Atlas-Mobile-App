// import { useEffect, useState } from 'react';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { createRestaurant } from '../api/apiConfig';
// import { Alert } from 'react-native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import RNFS from 'react-native-fs';
// import { useImagePicker } from './useImagePicker';

// export const useRegisterShop = () => {
//   const navigation = useNavigation<any>();
//   const route = useRoute<any>();

//   const [name, setName] = useState('');
//   const [address, setAddress] = useState('');
//   const [openingHours, setOpeningHours] = useState('');
//   const [wardId, setWardId] = useState<any>(null);
//   const [latitude, setLatitude] = useState<number | null>(null);
//   const [longitude, setLongitude] = useState<number | null>(null);
//   const { handleAddPhoto, images, setImages } = useImagePicker();

//   useEffect(() => {
//     if (route.params?.location) {
//       setLatitude(route.params.location.latitude);
//       setLongitude(route.params.location.longitude);
//     }
//   }, [route.params]);

//   const handleSubmit = async () => {
//     if (!name || !address || !wardId)
//       return Alert.alert('Vui lòng nhập đủ thông tin', name + address + wardId);

//     const payload = {
//       name,
//       address,
//       wardId: wardId as number,
//       latitude: latitude as number,
//       longitude: longitude as number,
//       openingHours: {
//         key_0: '08:00 - 22:00',
//         key_1: 'Cả tuần',
//       },
//       images: {
//         photo: images[0] as string,
//       },
//     };

//     try {
//       console.log('Payload for creating restaurant:', payload);
//       await createRestaurant(payload);
//       Alert.alert('Đăng ký quán thành công!');
//       navigation.goBack();
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Lỗi khi đăng ký quán');
//     }
//   };

//   return {
//     name,
//     setName,
//     address,
//     setAddress,
//     openingHours,
//     setOpeningHours,
//     wardId,
//     setWardId,
//     latitude,
//     longitude,
//     handleSubmit,
//     handleAddPhoto,
//     images,
//     setImages,
//   };
// };

import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createRestaurant } from '../api/apiConfig';
import { Alert } from 'react-native';
import { useImagePicker } from './useImagePicker';
import { useRestaurantTags } from './useRestaurantTags';

export const useRegisterShop = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [wardId, setWardId] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const {
    handleAddPhoto,
    uploadAllImages,
    localImages,
    removeImage,
    uploading,
  } = useImagePicker('multiple');

  const {
    tags,
    selectedTags,
    loading: tagsLoading,
    toggleTag,
    isTagSelected,
  } = useRestaurantTags();

  useEffect(() => {
    if (route.params?.location) {
      setLatitude(route.params.location.latitude);
      setLongitude(route.params.location.longitude);
    }
  }, [route.params]);

  const handleSubmit = async () => {
    if (!name || !address || !wardId || !latitude || !longitude) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin bắt buộc');
    }

    if (localImages.length === 0) {
      return Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một ảnh');
    }

    if (selectedTags.length === 0) {
      return Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một loại quán');
    }

    try {
      // Upload tất cả ảnh lên Cloudinary
      const uploadedUrls = await uploadAllImages();

      // ✅ Tạo images với value là string URL (không phải object)
      const imagesObject: { [key: string]: string } = {};
      uploadedUrls.forEach((url, index) => {
        imagesObject[`photo_${index}`] = url; // ✅ Chỉ gửi URL string
      });

      const payload = {
        name,
        address,
        wardId: wardId as number,
        latitude: latitude as number, // ✅ Gửi number trực tiếp
        longitude: longitude as number, // ✅ Gửi number trực tiếp
        tagIds: selectedTags,
        openingHours: {
          key_0: openingHours || '08:00 - 22:00',
          key_1: 'Cả tuần',
        },
        images: imagesObject, // ✅ Map<String, String>
      };

      console.log('✅ Payload gửi lên:', JSON.stringify(payload, null, 2));

      const response = await createRestaurant(payload);

      console.log('✅ Response:', response.data);
      Alert.alert('✅ Thành công', 'Đăng ký quán thành công!');
      navigation.navigate('AddShop');
    } catch (error: any) {
      console.error('❌ Error:', error);
      console.error(
        '❌ Response:',
        JSON.stringify(
          {
            status: error.response?.status,
            data: error.response?.data,
          },
          null,
          2,
        ),
      );

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        JSON.stringify(error.response?.data) ||
        'Lỗi khi đăng ký quán. Vui lòng thử lại.';

      Alert.alert('❌ Lỗi', errorMsg);
    }
  };

  return {
    name,
    setName,
    address,
    setAddress,
    openingHours,
    setOpeningHours,
    wardId,
    setWardId,
    latitude,
    longitude,
    handleSubmit,
    handleAddPhoto,
    localImages,
    removeImage,
    uploading,
    tags,
    selectedTags,
    tagsLoading,
    toggleTag,
    isTagSelected,
  };
};
