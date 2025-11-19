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
import { createDish } from '../api/apiConfig';
import { useImagePicker } from '../hooks/useImagePicker';

const AddDishScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { restaurantId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(false);

  // Sử dụng hook chọn ảnh (single mode)
  const {
    localImages,
    uploading,
    handleAddPhoto,
    uploadAllImages,
    removeImage,
    clearImages,
  } = useImagePicker('single');

  const handleCreate = async () => {
    if (!name || !description || !price || localImages.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin và chọn ảnh!');
      return;
    }
    setLoading(true);
    try {
      // Upload ảnh lên Cloudinary, lấy url
      const uploadedUrls = await uploadAllImages();
      await createDish({
        restaurantId,
        name,
        images: uploadedUrls,
        description,
        price: parseFloat(price),
        status,
      });
      Alert.alert('Thành công', 'Đã thêm món ăn!', [
        {
          text: 'OK',
          onPress: () => {
            clearImages();
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thêm món ăn!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: 40 }]}>
      <Text style={styles.title}>Thêm món ăn mới</Text>
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
      {/* Nút thêm ảnh */}
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
          Thêm ảnh ({localImages.length}/10)
        </Text>
      </TouchableOpacity>
      {/* Hiển thị ảnh đã chọn */}
      {localImages.length > 0 && (
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {localImages.map((uri, idx) => (
            <View key={idx} style={{ marginRight: 10, position: 'relative' }}>
              <Image
                source={{ uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                }}
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
        onPress={handleCreate}
        disabled={loading || uploading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Đang lưu...' : 'Thêm món ăn'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddDishScreen;
