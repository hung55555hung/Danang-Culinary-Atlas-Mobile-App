import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const LicenseDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { license, restaurantId } = route.params || {};

  const handleViewImage = () => {
    navigation.navigate('ImagePreview', { imageUri: license.documentUrl });
  };

  const getStatusColor = () => {
    switch (license.approvalStatus) {
      case 'APPROVED':
        return '#2ecc40';
      case 'PENDING':
        return '#f1c40f';
      case 'REJECTED':
        return '#e74c3c';
      default:
        return '#888';
    }
  };

  const getStatusText = () => {
    switch (license.approvalStatus) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return 'Không rõ';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 }}>
      <Header title="Thông tin giấy phép" showBack={true} />

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Loại giấy phép */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Loại giấy phép:
          </Text>
          <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
            {license.licenseType === 'BUSINESS_REGISTRATION'
              ? 'Giấy phép kinh doanh'
              : 'Giấy phép ATVS thực phẩm'}
          </Text>
        </View>

        {/* Số giấy phép */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Số giấy phép:
          </Text>
          <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
            {license.licenseNumber}
          </Text>
        </View>

        {/* Ngày cấp */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Ngày cấp:
          </Text>
          <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
            {new Date(license.issueDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {/* Ngày hết hạn */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Ngày hết hạn:
          </Text>
          <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
            {new Date(license.expireDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        {/* Trạng thái */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Trạng thái:
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: getStatusColor(),
              fontWeight: '700',
            }}
          >
            {getStatusText()}
          </Text>
        </View>

        {/* Ảnh giấy phép */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Ảnh giấy phép:
          </Text>
          <TouchableOpacity onPress={handleViewImage} activeOpacity={0.7}>
            <Image
              source={{ uri: license.documentUrl }}
              style={{
                width: '100%',
                height: 250,
                borderRadius: 8,
                backgroundColor: '#f0f0f0',
              }}
              resizeMode="cover"
            />
            <Text
              style={{
                textAlign: 'center',
                color: '#0C516F',
                marginTop: 8,
                fontSize: 13,
              }}
            >
              Nhấn vào ảnh để xem phóng to
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LicenseDetailScreen;
