import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import styles from '../styles/RegisterShopStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useLocation } from '../hooks/useLocation';
import { useRegisterShop } from '../hooks/useRegisterShop';
import { useImagePicker } from '../hooks/useImagePicker';

export default function RegisterShopScreen() {
  const navigate = useNavigation<any>();
  const { cities, districts, wards, fetchDistricts, fetchWards } =
    useLocation();
  const {
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
  } = useRegisterShop();
  const { handleAddPhoto, images, setImages } = useImagePicker();

  const [city, setCity] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);
  const [ward, setWard] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'district' | 'ward'>(
    'city',
  );

  const handleSelectCity = (item: any) => {
    setCity(item);
    setDistrict(null);
    setWard(null);
    fetchDistricts(item.code);
    setModalVisible(false);
  };

  const handleSelectDistrict = (item: any) => {
    setDistrict(item);
    setWard(null);
    fetchWards(item.code);
    setModalVisible(false);
  };

  const handleSelectWard = (item: any) => {
    setWard(item);
    setWardId(item.code);
    setModalVisible(false);
  };

  const openModal = (type: 'city' | 'district' | 'ward') => {
    setModalType(type);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Thanh tiêu đề */}
      <Header title="Đăng ký quán" showBack={true} />
      <View style={{ marginTop: 30, flex: 1 }}>
        {/* Dropdown chọn địa chỉ */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openModal('city')}
        >
          <Text style={styles.dropdownText}>
            {city?.name || 'Chọn Tỉnh/Thành phố'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => city && openModal('district')}
          disabled={!city}
        >
          <Text style={styles.dropdownText}>
            {district?.name || 'Chọn Quận/Huyện'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => district && openModal('ward')}
          disabled={!district}
        >
          <Text style={styles.dropdownText}>
            {ward?.name || 'Chọn Phường/Xã'}
          </Text>
        </TouchableOpacity>

        {/* Các ô nhập liệu khác */}
        <TextInput
          style={styles.input}
          placeholder="Tên quán *"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Số nhà và đường *"
          placeholderTextColor="#555"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại liên hệ *"
          placeholderTextColor="#555"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Giờ hoạt động"
          placeholderTextColor="#555"
          value={openingHours}
          onChangeText={setOpeningHours}
        />

        {/* Nút chọn vị trí */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => navigate.navigate('PickLocation')}
        >
          <Text style={styles.dropdownText}>
            {latitude && longitude
              ? `Vĩ độ: ${latitude.toFixed(5)} - Kinh độ: ${longitude.toFixed(
                  5,
                )}`
              : 'Chọn vị trí trên bản đồ'}
          </Text>
        </TouchableOpacity>

        {/* Nút thêm ảnh */}
        <TouchableOpacity style={styles.uploadButton} onPress={handleAddPhoto}>
          <Image
            source={require('../assets/add_image.png')}
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadText}>Thêm ảnh và video</Text>
        </TouchableOpacity>

        {/* Nút đăng ký */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>＋ Đăng ký quán</Text>
        </TouchableOpacity>

        {/* 🔹 Modal hiển thị danh sách chọn */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ padding: 15, alignSelf: 'flex-end' }}
            >
              <Text style={{ color: 'red', fontSize: 16 }}>Đóng</Text>
            </TouchableOpacity>

            <FlatList
              data={
                modalType === 'city'
                  ? cities
                  : modalType === 'district'
                  ? districts
                  : wards
              }
              keyExtractor={item => item.code.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}
                  onPress={() =>
                    modalType === 'city'
                      ? handleSelectCity(item)
                      : modalType === 'district'
                      ? handleSelectDistrict(item)
                      : handleSelectWard(item)
                  }
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}
