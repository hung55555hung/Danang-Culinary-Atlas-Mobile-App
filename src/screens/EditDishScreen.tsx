import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../styles/VendorDishesStyles';
import { updateDish } from '../api/apiConfig';
import { useImagePicker } from '../hooks/useImagePicker';

const EditDishScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { dish } = route.params || {};

  if (!dish) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Không có dữ liệu món ăn</Text>
      </View>
    );
  }

  const [name, setName] = useState<string>(dish?.name || '');
  const [description, setDescription] = useState<string>(
    dish?.description || '',
  );
  const [price, setPrice] = useState<string>(
    typeof dish?.price === 'number' ? String(dish.price) : dish?.price || '',
  );
  const [status, setStatus] = useState<'AVAILABLE' | 'SOLD_OUT'>(
    dish?.status || 'AVAILABLE',
  );
  const [loading, setLoading] = useState(false);

  // Cho phép chọn lại ảnh (nếu không chọn, sẽ dùng images cũ của dish)
  const {
    localImages,
    uploading,
    handleAddPhoto,
    uploadAllImages,
    removeImage,
    clearImages,
  } = useImagePicker('single');

  const handleUpdate = async () => {
    if (!name || !description || !price) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      let imagesToSend: string[] = Array.isArray(dish?.images)
        ? dish.images
        : [];
      // Nếu có chọn ảnh mới, upload và thay thế
      if (localImages.length > 0) {
        imagesToSend = await uploadAllImages();
      }
      await updateDish(dish.dishId, {
        name,
        images: imagesToSend,
        description,
        price: parseFloat(price),
        status,
      });

      Alert.alert('Thành công', 'Đã cập nhật món ăn!', [
        {
          text: 'OK',
          onPress: () => {
            clearImages();
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật món ăn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: 40 }]}>
      <Text style={styles.title}>Cập nhật món ăn</Text>

      {/* Trạng thái: 2 lựa chọn Đang bán / Ngừng bán */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() => setStatus('AVAILABLE')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            marginRight: 8,
            backgroundColor: status === 'AVAILABLE' ? '#2ecc40' : '#eee',
          }}
        >
          <Text style={{ color: status === 'AVAILABLE' ? '#fff' : '#333' }}>
            Đang bán
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStatus('SOLD_OUT')}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: status === 'SOLD_OUT' ? '#e74c3c' : '#eee',
          }}
        >
          <Text style={{ color: status === 'SOLD_OUT' ? '#fff' : '#333' }}>
            Ngừng bán
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên món ăn"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Giá"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      {/* Ảnh hiện tại của món ăn */}
      {Array.isArray(dish?.images) &&
        dish.images.length > 0 &&
        localImages.length === 0 && (
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {dish.images.map((uri: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  marginRight: 10,
                }}
              />
            ))}
          </View>
        )}

      {/* Nút chọn ảnh mới (nếu muốn thay thế ảnh cũ) */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleAddPhoto}
        testID="btn-add-photo"
        accessibilityLabel="btn-add-photo"
      >
        <Image
          source={require('../assets/add_image.png')}
          style={styles.uploadIcon}
        />
        <Text style={styles.uploadText}>
          {localImages.length > 0 ? 'Thay ảnh mới' : 'Chọn ảnh mới (tùy chọn)'}
        </Text>
      </TouchableOpacity>

      {/* Hiển thị ảnh mới đã chọn */}
      {localImages.length > 0 && (
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {localImages.map((uri, idx) => (
            <View key={idx} style={{ marginRight: 10, position: 'relative' }}>
              <Image
                source={{ uri }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  padding: 2,
                }}
                onPress={() => removeImage(idx)}
              >
                <Text style={{ color: 'red', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {(uploading || loading) && (
        <ActivityIndicator style={{ marginBottom: 12 }} />
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          { marginTop: 20, opacity: loading ? 0.6 : 1 },
        ]}
        onPress={handleUpdate}
        disabled={loading || uploading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Đang lưu...' : 'Cập nhật'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditDishScreen;
