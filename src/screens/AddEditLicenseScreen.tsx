import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import { uploadLicense, updateLicense } from '../api/apiConfig';
import Header from '../components/Header';

const AddEditLicenseScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {
    restaurantId,
    license,
    mode,
    licenseType: initialType,
  } = route.params || {};

  const isEditMode = mode === 'edit' && license;

  const [licenseType, setLicenseType] = useState(
    license?.licenseType || initialType || 'BUSINESS_REGISTRATION',
  );
  const [licenseNumber, setLicenseNumber] = useState(
    license?.licenseNumber || '',
  );
  const [issueDate, setIssueDate] = useState<Date>(
    license ? new Date(license.issueDate) : new Date(),
  );
  const [expireDate, setExpireDate] = useState<Date>(
    license ? new Date(license.expireDate) : new Date(),
  );
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(
    license?.documentUrl || null,
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleViewImage = () => {
    if (imageUri) {
      navigation.navigate('ImagePreview', { imageUri });
    }
  };

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
      if (isEditMode) {
        await updateLicense(license.licenseId, payload);
        Alert.alert('Thành công', 'Đã cập nhật giấy phép thành công!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('AddShop');
            },
          },
        ]);
      } else {
        await uploadLicense(payload);
        Alert.alert('Thành công', 'Đã tải lên giấy phép thành công!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('AddShop');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error uploading license:', error);
      Alert.alert('Lỗi', 'Không thể lưu giấy phép. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 }}>
      <Header
        title={isEditMode ? 'Chỉnh sửa giấy phép' : 'Thêm giấy phép'}
        showBack={true}
      />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Loại giấy phép */}
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Loại giấy phép:
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 10 }}>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor:
                licenseType === 'BUSINESS_REGISTRATION' ? '#0C516F' : '#ddd',
              backgroundColor:
                licenseType === 'BUSINESS_REGISTRATION' ? '#E8F4F8' : '#f5f5f5',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color:
                  licenseType === 'BUSINESS_REGISTRATION' ? '#0C516F' : '#999',
                fontWeight:
                  licenseType === 'BUSINESS_REGISTRATION' ? 'bold' : 'normal',
                fontSize: 13,
              }}
            >
              Giấy phép kinh doanh
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor:
                licenseType === 'FOOD_SAFETY_CERT' ? '#0C516F' : '#ddd',
              backgroundColor:
                licenseType === 'FOOD_SAFETY_CERT' ? '#E8F4F8' : '#f5f5f5',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: licenseType === 'FOOD_SAFETY_CERT' ? '#0C516F' : '#999',
                fontWeight:
                  licenseType === 'FOOD_SAFETY_CERT' ? 'bold' : 'normal',
                fontSize: 13,
              }}
            >
              ATTP
            </Text>
          </View>
        </View>

        {/* Số giấy phép */}
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Số giấy phép:
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            fontSize: 15,
          }}
          placeholder="Nhập số giấy phép"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />

        {/* Ngày cấp */}
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Ngày cấp:
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            backgroundColor: '#fff',
          }}
          onPress={() => setShowIssueDatePicker(true)}
        >
          <Text style={{ color: '#333', fontSize: 15 }}>
            {formatDate(issueDate)}
          </Text>
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
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Ngày hết hạn:
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            backgroundColor: '#fff',
          }}
          onPress={() => setShowExpireDatePicker(true)}
        >
          <Text style={{ color: '#333', fontSize: 15 }}>
            {formatDate(expireDate)}
          </Text>
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
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          Tài liệu giấy phép (ảnh/PDF):
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: '#0C516F',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            marginBottom: 16,
            backgroundColor: '#E8F4F8',
          }}
          onPress={handlePickImage}
        >
          <Text style={{ color: '#0C516F', fontWeight: '600', fontSize: 15 }}>
            {imageUri ? 'Đổi tài liệu' : 'Chọn tài liệu'}
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity onPress={handleViewImage} activeOpacity={0.7}>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: 8,
              }}
              resizeMode="cover"
            />
            <Text
              style={{
                textAlign: 'center',
                color: '#0C516F',
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              Nhấn vào ảnh để xem phóng to
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action buttons */}
      <View
        style={{
          flexDirection: 'row',
          padding: 16,
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 8,
            backgroundColor: '#ddd',
          }}
          onPress={() => navigation.goBack()}
          disabled={uploading}
        >
          <Text
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
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
                fontSize: 16,
              }}
            >
              {isEditMode ? 'Cập nhật' : 'Tải lên'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddEditLicenseScreen;
