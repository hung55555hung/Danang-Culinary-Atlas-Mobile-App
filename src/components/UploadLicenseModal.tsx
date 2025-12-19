import React, { useState, useEffect } from 'react';
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
import { uploadLicense, updateLicense } from '../api/apiConfig';

interface UploadLicenseModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantId: string;
  initialLicenseType?: string;
  existingLicense?: {
    licenseId: string;
    licenseType: string;
    licenseNumber: string;
    issueDate: string;
    expireDate: string;
    documentUrl: string;
  } | null;
}

const UploadLicenseModal: React.FC<UploadLicenseModalProps> = ({
  visible,
  onClose,
  restaurantId,
  initialLicenseType = 'BUSINESS_REGISTRATION',
  existingLicense,
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

  // Load existing license data if editing
  useEffect(() => {
    if (existingLicense) {
      setLicenseType(existingLicense.licenseType);
      setLicenseNumber(existingLicense.licenseNumber);
      setIssueDate(new Date(existingLicense.issueDate));
      setExpireDate(new Date(existingLicense.expireDate));
      setImageUri(existingLicense.documentUrl);
    } else {
      setLicenseType(initialLicenseType);
      setLicenseNumber('');
      setIssueDate(new Date());
      setExpireDate(new Date());
      setImageUri(null);
      setImageBase64(null);
    }
  }, [existingLicense, visible, initialLicenseType]);

  const resetForm = () => {
    setLicenseType(initialLicenseType);
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

  // Note: Currently using image picker for license photos.
  // To support PDF files, you can install react-native-document-picker
  // and modify this function to handle PDF selection

  const handleSubmit = async () => {
    // Validate
    if (!licenseNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số giấy phép');
      return;
    }

    setUploading(true);

    try {
      let documentUrl = imageUri;

      // Upload ảnh mới nếu có chọn ảnh từ thiết bị
      if (imageBase64) {
        const base64Image = `data:image/jpeg;base64,${imageBase64}`;
        documentUrl = await uploadToCloudinary(base64Image);
      }

      if (!documentUrl) {
        Alert.alert('Lỗi', 'Không có file giấy phép');
        setUploading(false);
        return;
      }

      const payload = {
        restaurantId,
        licenseType,
        licenseNumber,
        issueDate: formatDate(issueDate),
        expireDate: formatDate(expireDate),
        documentUrl,
      };

      // Nếu đang chỉnh sửa, gọi API update, ngược lại gọi API create
      if (existingLicense) {
        await updateLicense(existingLicense.licenseId, payload);
        Alert.alert('Thành công', 'Đã cập nhật giấy phép thành công!');
      } else {
        await uploadLicense(payload);
        Alert.alert('Thành công', 'Đã tải lên giấy phép thành công!');
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error uploading license:', error);
      Alert.alert('Lỗi', 'Không thể lưu giấy phép. Vui lòng thử lại!');
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
                marginBottom: 16,
                color: '#333',
              }}
            >
              {existingLicense
                ? 'Chỉnh sửa giấy phép'
                : 'Thêm giấy phép kinh doanh'}
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
                      : existingLicense
                      ? '#f5f5f5'
                      : '#fff',
                  marginRight: 8,
                }}
                onPress={() =>
                  !existingLicense && setLicenseType('BUSINESS_REGISTRATION')
                }
                disabled={!!existingLicense}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color:
                      licenseType === 'BUSINESS_REGISTRATION'
                        ? '#0C516F'
                        : existingLicense
                        ? '#999'
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
                    licenseType === 'FOOD_SAFETY_CERT' ? '#0C516F' : '#ddd',
                  backgroundColor:
                    licenseType === 'FOOD_SAFETY_CERT'
                      ? '#E8F4F8'
                      : existingLicense
                      ? '#f5f5f5'
                      : '#fff',
                }}
                onPress={() =>
                  !existingLicense && setLicenseType('FOOD_SAFETY_CERT')
                }
                disabled={!!existingLicense}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color:
                      licenseType === 'FOOD_SAFETY_CERT'
                        ? '#0C516F'
                        : existingLicense
                        ? '#999'
                        : '#666',
                    fontWeight:
                      licenseType === 'FOOD_SAFETY_CERT' ? 'bold' : 'normal',
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

            {/* Chọn ảnh/file */}
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Tài liệu giấy phép (ảnh/PDF):
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
                {imageUri ? 'Đổi tài liệu' : 'Chọn tài liệu'}
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
                    {existingLicense ? 'Cập nhật' : 'Tải lên'}
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
