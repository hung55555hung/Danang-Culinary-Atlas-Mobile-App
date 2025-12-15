import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useImagePicker } from './useImagePicker';
import { useRestaurantTags } from './useRestaurantTags';
import {
  getRestaurantById,
  getWardById,
  getTagsByRestaurantId,
} from '../api/apiConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useEditShop = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const restaurantId = route.params?.restaurantId;
  console.log('🛠️ Editing restaurant with ID:', restaurantId);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState<{ [key: string]: string }>(
    {},
  );
  const [wardId, setWardId] = useState<any>(null);
  const [wardInfo, setWardInfo] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    handleAddPhoto,
    uploadAllImages,
    localImages,
    removeImage,
    uploading,
    setLocalImages,
  } = useImagePicker('multiple');

  const {
    tags,
    selectedTags,
    setSelectedTags,
    loading: tagsLoading,
    toggleTag,
    isTagSelected,
  } = useRestaurantTags();

  // Load dữ liệu quán hiện tại
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!restaurantId) {
        Alert.alert('Lỗi', 'Không tìm thấy ID quán');
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        const response = await getRestaurantById(restaurantId);
        const restaurant = response.data;

        console.log('📥 Loaded restaurant data:', restaurant);

        // Set thông tin cơ bản
        setName(restaurant.name || '');
        setAddress(restaurant.address || '');

        // Xử lý wardId - có thể là object ward hoặc số wardId trực tiếp
        if (restaurant.ward?.wardId) {
          setWardId(restaurant.ward.wardId);
        } else if (restaurant.wardId) {
          setWardId(restaurant.wardId);
        }

        setLatitude(restaurant.latitude || null);
        setLongitude(restaurant.longitude || null);

        // Set opening hours
        if (
          restaurant.openingHours &&
          typeof restaurant.openingHours === 'object'
        ) {
          setOpeningHours(restaurant.openingHours);
        }

        // Set images - xử lý images là object với photo và sub_photo
        if (restaurant.images && typeof restaurant.images === 'object') {
          const imageUrls: string[] = [];

          // Thêm ảnh chính (photo)
          if (restaurant.images.photo) {
            imageUrls.push(restaurant.images.photo);
          }

          // Thêm các ảnh phụ (sub_photo)
          if (
            restaurant.images.sub_photo &&
            Array.isArray(restaurant.images.sub_photo)
          ) {
            imageUrls.push(...restaurant.images.sub_photo);
          }

          console.log('📸 Loaded images:', imageUrls.length, 'images');
          setLocalImages(imageUrls);
        } else if (restaurant.images && Array.isArray(restaurant.images)) {
          // Fallback: nếu images là array (format cũ)
          const imageUrls = restaurant.images.map(
            (img: any) => img.imageUrl || img,
          );
          setLocalImages(imageUrls);
        }

        // Load thông tin ward từ wardId
        const loadedWardId = restaurant.ward?.wardId || restaurant.wardId;
        if (loadedWardId) {
          try {
            const wardResponse = await getWardById(loadedWardId);
            const wardData = wardResponse.data;
            console.log('📍 Ward info:', wardData);
            setWardInfo(wardData);
          } catch (wardError) {
            console.error('❌ Error loading ward info:', wardError);
          }
        }
      } catch (error: any) {
        console.error('❌ Error loading restaurant:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin quán');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [restaurantId]);

  // 🔹 Fetch tags riêng cho nhà hàng
  useEffect(() => {
    const fetchRestaurantTags = async () => {
      if (!restaurantId) return;

      try {
        console.log('🔄 Đang fetch tags cho nhà hàng:', restaurantId);
        const response = await getTagsByRestaurantId(restaurantId);
        const fetchedTags = response.data || [];
        console.log('✅ Đã tải tags:', fetchedTags);

        // Set selected tags từ API
        if (Array.isArray(fetchedTags) && fetchedTags.length > 0) {
          const tagIds = fetchedTags.map((tag: any) => tag.tagId);
          setSelectedTags(tagIds);
          console.log('✅ Selected tag IDs:', tagIds);
        } else {
          console.log('⚠️ No tags found for this restaurant');
          setSelectedTags([]);
        }
      } catch (error) {
        console.error('❌ Error fetching restaurant tags:', error);
        setSelectedTags([]);
      }
    };

    fetchRestaurantTags();
  }, [restaurantId]);

  // Xử lý cập nhật vị trí từ PickLocationScreen
  useEffect(() => {
    if (route.params?.location) {
      setLatitude(route.params.location.latitude);
      setLongitude(route.params.location.longitude);
    }
  }, [route.params]);

  const addOpeningHour = () => {
    const newKey = `day${Object.keys(openingHours).length + 1}`;
    setOpeningHours(prev => ({ ...prev, [newKey]: '' }));
  };

  const removeOpeningHour = (key: string) => {
    setOpeningHours(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const updateOpeningHour = (oldKey: string, newKey: string, value: string) => {
    setOpeningHours(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) {
        delete updated[oldKey];
      }
      updated[newKey] = value;
      return updated;
    });
  };

  const handleSubmit = async () => {
    console.log('🔍 Validation check:');
    console.log('- name:', name);
    console.log('- address:', address);
    console.log('- wardId:', wardId);
    console.log('- latitude:', latitude);
    console.log('- longitude:', longitude);
    console.log('- localImages:', localImages.length);
    console.log('- selectedTags:', selectedTags);

    if (!name || !address || !wardId || !latitude || !longitude) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin bắt buộc');
    }

    if (localImages.length === 0) {
      return Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một ảnh');
    }

    // Chỉ cảnh báo nếu không có tags, không block việc submit
    if (selectedTags.length === 0) {
      console.log('⚠️ Warning: No tags selected');
    }

    try {
      // Phân loại ảnh: ảnh cũ (URL) và ảnh mới (local URI)
      const oldImages = localImages.filter(img => img.startsWith('http'));
      const newImages = localImages.filter(img => !img.startsWith('http'));

      // Upload ảnh mới lên Cloudinary
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadAllImages(newImages);
      }

      // Kết hợp ảnh cũ và ảnh mới
      const allImageUrls = [...oldImages, ...uploadedUrls];

      // ✅ Tạo images object với ảnh đầu tiên là photo, các ảnh còn lại là sub_photo
      const imagesObject: any = {
        photo: allImageUrls[0], // Ảnh đầu tiên
      };

      // Nếu có nhiều hơn 1 ảnh, thêm các ảnh còn lại vào sub_photo
      if (allImageUrls.length > 1) {
        imagesObject.sub_photo = allImageUrls.slice(1); // Các ảnh từ vị trí 1 trở đi
      }

      // Tạo payload - chỉ gửi tagIds nếu có tags được chọn
      const payload: any = {
        name,
        address,
        wardId: wardId as number,
        latitude: latitude as number,
        longitude: longitude as number,
        openingHours: openingHours,
        images: imagesObject,
      };

      // Chỉ thêm tagIds nếu có tags được chọn
      if (selectedTags.length > 0) {
        payload.tagIds = selectedTags;
      }

      console.log('✅ Payload cập nhật:', JSON.stringify(payload, null, 2));

      // Gọi API PATCH để cập nhật
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(
        `https://danangculinaryatlas.site/api/v1/restaurants/${restaurantId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('✅ Response:', response.data);
      Alert.alert('✅ Thành công', 'Cập nhật quán thành công!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
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
        'Lỗi khi cập nhật quán. Vui lòng thử lại.';

      Alert.alert('❌ Lỗi', errorMsg);
    }
  };

  return {
    name,
    setName,
    address,
    setAddress,
    openingHours,
    addOpeningHour,
    removeOpeningHour,
    updateOpeningHour,
    wardId,
    setWardId,
    wardInfo,
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
    loading,
  };
};
