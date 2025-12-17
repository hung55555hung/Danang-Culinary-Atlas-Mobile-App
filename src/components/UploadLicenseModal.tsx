import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { uploadLicense } from '../api/apiConfig';

interface UploadLicenseModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

const UploadLicenseModal: React.FC<UploadLicenseModalProps> = ({
  visible,
  onClose,
  restaurantId,
  restaurantName,
}) => {
  const [licenseType, setLicenseType] = useState('BUSINESS_REGISTRATION');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [expireDate, setExpireDate] = useState<Date>(new Date());
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setLicenseType('BUSINESS_REGISTRATION');
    setLicenseNumber('');
    setIssueDate(new Date());
    setExpireDate(new Date());
    setImageUri(null);
    setImageBase64(null);
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onIssueDateChange = (event: any, selectedDate?: Date) => {
    setShowIssueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIssueDate(selectedDate);
    }
  };

  const onExpireDateChange = (event: any, selectedDate?: Date) => {
    setShowExpireDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpireDate(selectedDate);
    }
  };

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Lỗi', 'Không thể chọn ảnh');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          setImageUri(asset.uri || null);
          setImageBase64(asset.base64 || null);
        }
      },
    );
  };

  const handleSubmit = async () => {
    // Validate
    if (!licenseNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số giấy phép');
      return;
    }
    if (!imageUri || !imageBase64) {
      Alert.alert('Thông báo', 'Vui lòng chọn ảnh giấy phép');
      return;
    }

    setUploading(true);

    try {
      // 1. Upload ảnh lên Cloudinary
      const base64Image = `data:image/jpeg;base64,${imageBase64}`;
      const documentUrl = await uploadToCloudinary(base64Image);

      // 2. Gọi API để lưu thông tin giấy phép
      await uploadLicense({
        restaurantId,
        licenseType,
        licenseNumber,
        issueDate: formatDate(issueDate),
        expireDate: formatDate(expireDate),
        documentUrl,
      });

      Alert.alert('Thành công', 'Đã tải lên giấy phép thành công!');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error uploading license:', error);
      Alert.alert('Lỗi', 'Không thể tải lên giấy phép. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            width: '90%',
            maxHeight: '80%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 8,
                color: '#333',
              }}
            >
              Thêm giấy phép
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 16,
              }}
            >
              Quán: {restaurantName}
            </Text>

            {/* Loại giấy phép */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Loại giấy phép:
            </Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    licenseType === 'BUSINESS_REGISTRATION'
                      ? '#0C516F'
                      : '#ddd',
                  backgroundColor:
                    licenseType === 'BUSINESS_REGISTRATION'
                      ? '#E8F4F8'
                      : '#fff',
                  marginRight: 8,
                }}
                onPress={() => setLicenseType('BUSINESS_REGISTRATION')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color:
                      licenseType === 'BUSINESS_REGISTRATION'
                        ? '#0C516F'
                        : '#666',
                    fontWeight:
                      licenseType === 'BUSINESS_REGISTRATION'
                        ? 'bold'
                        : 'normal',
                  }}
                >
                  Giấy phép kinh doanh
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    licenseType === 'FOOD_SAFETY' ? '#0C516F' : '#ddd',
                  backgroundColor:
                    licenseType === 'FOOD_SAFETY' ? '#E8F4F8' : '#fff',
                }}
                onPress={() => setLicenseType('FOOD_SAFETY')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: licenseType === 'FOOD_SAFETY' ? '#0C516F' : '#666',
                    fontWeight:
                      licenseType === 'FOOD_SAFETY' ? 'bold' : 'normal',
                  }}
                >
                  ATTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Số giấy phép */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Số giấy phép:
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
              placeholder="Nhập số giấy phép"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />

            {/* Ngày cấp */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Ngày cấp:
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#fff',
              }}
              onPress={() => setShowIssueDatePicker(true)}
            >
              <Text style={{ color: '#333' }}>{formatDate(issueDate)}</Text>
            </TouchableOpacity>
            {showIssueDatePicker && (
              <DateTimePicker
                value={issueDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onIssueDateChange}
              />
            )}

            {/* Ngày hết hạn */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Ngày hết hạn:
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#fff',
              }}
              onPress={() => setShowExpireDatePicker(true)}
            >
              <Text style={{ color: '#333' }}>{formatDate(expireDate)}</Text>
            </TouchableOpacity>
            {showExpireDatePicker && (
              <DateTimePicker
                value={expireDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onExpireDateChange}
              />
            )}

            {/* Chọn ảnh */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Ảnh giấy phép:
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: '#0C516F',
                borderRadius: 8,
                padding: 12,
                alignItems: 'center',
                marginBottom: 12,
                backgroundColor: '#E8F4F8',
              }}
              onPress={handlePickImage}
            >
              <Text style={{ color: '#0C516F', fontWeight: '600' }}>
                {imageUri ? 'Đổi ảnh' : 'Chọn ảnh'}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />
            )}

            {/* Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: '#ddd',
                  marginRight: 8,
                }}
                onPress={() => {
                  resetForm();
                  onClose();
                }}
                disabled={uploading}
              >
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 8,
                  backgroundColor: uploading ? '#999' : '#0C516F',
                }}
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    Tải lên
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default UploadLicenseModal;
