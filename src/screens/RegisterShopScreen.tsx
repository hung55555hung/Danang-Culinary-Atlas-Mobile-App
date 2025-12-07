import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles/RegisterShopStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useLocation } from '../hooks/useLocation';
import { useRegisterShop } from '../hooks/useRegisterShop';

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
    addOpeningHour,
    removeOpeningHour,
    updateOpeningHour,
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
  } = useRegisterShop();

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
      <Header title="Đăng ký quán" showBack={true} />
      <View style={{ marginTop: 30, flex: 1 }}>
        {/* Dropdown chọn địa chỉ */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => openModal('city')}
          testID="select-city"
          accessibilityLabel="select-city"
        >
          <Text style={styles.dropdownText}>
            {city?.name || 'Chọn Tỉnh/Thành phố'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => city && openModal('district')}
          disabled={!city}
          testID="select-district"
          accessibilityLabel="select-district"
        >
          <Text style={styles.dropdownText}>
            {district?.name || 'Chọn Quận/Huyện'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => district && openModal('ward')}
          disabled={!district}
          testID="select-ward"
          accessibilityLabel="select-ward"
        >
          <Text style={styles.dropdownText}>
            {ward?.name || 'Chọn Phường/Xã'}
          </Text>
        </TouchableOpacity>

        {/* Các ô nhập liệu */}
        <TextInput
          style={styles.input}
          placeholder="Tên quán *"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          testID="input-name"
          accessibilityLabel="input-name"
        />
        <TextInput
          style={styles.input}
          placeholder="Số nhà và đường *"
          placeholderTextColor="#555"
          value={address}
          onChangeText={setAddress}
          testID="input-address"
          accessibilityLabel="input-address"
        />

        {/* Giờ hoạt động */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Giờ hoạt động *</Text>
          {Object.entries(openingHours).map(([key, value], index) => (
            <View key={key} style={styles.openingHourRow}>
              <TextInput
                style={[styles.input, styles.openingHourInput]}
                placeholder="Ngày (VD: Thứ 2-6)"
                placeholderTextColor="#555"
                value={key}
                onChangeText={newKey => updateOpeningHour(key, newKey, value)}
                testID={`input-day-${index}`}
                accessibilityLabel={`input-day-${index}`}
              />
              <TextInput
                style={[styles.input, styles.openingHourInput]}
                placeholder="Giờ (VD: 08:00 - 22:00)"
                placeholderTextColor="#555"
                value={value}
                onChangeText={newValue => updateOpeningHour(key, key, newValue)}
                testID={`input-time-${index}`}
                accessibilityLabel={`input-time-${index}`}
              />
              <TouchableOpacity
                style={styles.removeHourButton}
                onPress={() => removeOpeningHour(key)}
                testID={`btn-remove-hour-${index}`}
                accessibilityLabel={`btn-remove-hour-${index}`}
              >
                <Text style={styles.removeHourText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addHourButton}
            onPress={addOpeningHour}
            testID="btn-add-hour"
            accessibilityLabel="btn-add-hour"
          >
            <Text style={styles.addHourText}>＋ Thêm giờ hoạt động</Text>
          </TouchableOpacity>
        </View>

        {/* Nút chọn vị trí */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => navigate.navigate('PickLocation')}
          testID="btn-pick-location"
          accessibilityLabel="btn-pick-location"
        >
          <Text style={styles.dropdownText}>
            {latitude && longitude
              ? `Vĩ độ: ${latitude.toFixed(5)} - Kinh độ: ${longitude.toFixed(
                  5,
                )}`
              : 'Chọn vị trí trên bản đồ *'}
          </Text>
        </TouchableOpacity>

        {/* 🔹 Chọn loại quán (Tags) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Loại quán *</Text>
          {tagsLoading ? (
            <ActivityIndicator size="small" color="#1E90FF" />
          ) : (
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.tagId}
                  style={[
                    styles.tagButton,
                    isTagSelected(tag.tagId) && styles.tagButtonSelected,
                  ]}
                  onPress={() => toggleTag(tag.tagId)}
                  testID={`tag-${tag.tagId}`}
                  accessibilityLabel={`tag-${tag.tagId}`}
                >
                  <Text
                    style={[
                      styles.tagButtonText,
                      isTagSelected(tag.tagId) && styles.tagButtonTextSelected,
                    ]}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedTags.length > 0 && (
            <Text style={styles.selectedTagsText}>
              Đã chọn: {selectedTags.length} loại
            </Text>
          )}
        </View>

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

        {/* Preview ảnh đã chọn */}
        {localImages.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {localImages.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image
                    source={{ uri }}
                    style={styles.imagePreview}
                    testID={`preview-image-${index}`}
                    accessibilityLabel={`preview-image-${index}`}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    testID={`btn-remove-${index}`}
                    accessibilityLabel={`btn-remove-${index}`}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Nút đăng ký */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            uploading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={uploading}
          testID="btn-submit"
          accessibilityLabel="btn-submit"
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>＋ Đăng ký quán</Text>
          )}
        </TouchableOpacity>

        {/* Modal chọn địa chỉ */}
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
