import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createRestaurant } from '../api/apiConfig';
import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { useImagePicker } from './useImagePicker';

export const useRegisterShop = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [wardId, setWardId] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { handleAddPhoto, images, setImages } = useImagePicker();

  useEffect(() => {
    if (route.params?.location) {
      setLatitude(route.params.location.latitude);
      setLongitude(route.params.location.longitude);
    }
  }, [route.params]);

  const handleSubmit = async () => {
    if (!name || !address || !wardId)
      return Alert.alert('Vui lòng nhập đủ thông tin', name + address + wardId);

    const payload = {
      name,
      address,
      wardId: wardId as number,
      latitude: latitude as number,
      longitude: longitude as number,
      openingHours: {
        key_0: '08:00 - 22:00',
        key_1: 'Cả tuần',
      },
      images: {
        photo: images[0] as string,
      },
    };

    try {
      console.log('Payload for creating restaurant:', payload);
      await createRestaurant(payload);
      Alert.alert('Đăng ký quán thành công!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi khi đăng ký quán');
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
    images,
    setImages,
  };
};
