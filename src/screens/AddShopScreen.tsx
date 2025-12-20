import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles/AddShopStyles';
import Header from '../components/Header';
import {
  getVendorRestaurants,
  deleteRestaurant,
  getRestaurantLicenses,
  deleteLicense,
} from '../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UploadLicenseModal from '../components/UploadLicenseModal';

interface LicenseInfo {
  licenseId: string;
  licenseType: string;
  licenseNumber: string;
  issueDate: string;
  expireDate: string;
  documentUrl: string;
  approvalStatus: string;
}

interface ShopWithLicense {
  restaurantId: string;
  name: string;
  address: string;
  images: any;
  approvalStatus: string;
  businessLicense?: LicenseInfo | null;
  foodSafetyLicense?: LicenseInfo | null;
}

const AddShopScreen = () => {
  const navigation = useNavigation<any>();
  const [shops, setShops] = useState<ShopWithLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [licenseModalVisible, setLicenseModalVisible] = useState(false);
  const [selectedRestaurantForLicense, setSelectedRestaurantForLicense] =
    useState<string | null>(null);
  const [existingLicense, setExistingLicense] = useState<any>(null);
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>(
    'BUSINESS_REGISTRATION',
  );

  useEffect(() => {
    fetchVendorIdAndShops();
  }, []);

  const fetchVendorIdAndShops = async () => {
    const id = await AsyncStorage.getItem('accountID');
    if (id) {
      setVendorId(id);
      setLoading(true);
      try {
        const data = await getVendorRestaurants(id);
        console.log('Quán của vendor:', data);

        // Fetch licenses for each restaurant
        const shopsWithLicenses = await Promise.all(
          data.map(async (shop: any) => {
            try {
              const licenses = await getRestaurantLicenses(shop.restaurantId);
              // Tìm giấy phép kinh doanh (BUSINESS_REGISTRATION)
              const businessLicense = licenses.find(
                (lic: any) => lic.licenseType === 'BUSINESS_REGISTRATION',
              );
              // Tìm giấy phép an toàn vệ sinh thực phẩm (FOOD_SAFETY_CERT)
              const foodSafetyLicense = licenses.find(
                (lic: any) => lic.licenseType === 'FOOD_SAFETY_CERT',
              );
              return {
                ...shop,
                businessLicense: businessLicense || null,
                foodSafetyLicense: foodSafetyLicense || null,
              };
            } catch (err) {
              console.error(
                `Lỗi khi lấy license cho quán ${shop.restaurantId}:`,
                err,
              );
              return {
                ...shop,
                businessLicense: null,
                foodSafetyLicense: null,
              };
            }
          }),
        );

        setShops(shopsWithLicenses);
      } catch (err) {
        setShops([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Hàm xóa quán
  const handleDeleteShop = async (shop: any) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa quán "${shop.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Xóa quán với ID:', shop.restaurantId);
              await deleteRestaurant(shop.restaurantId);
              setShops(prev =>
                prev.filter((s: any) => s.restaurantId !== shop.restaurantId),
              );
              setModalVisible(false);
              setSelectedShop(null);
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa quán. Vui lòng thử lại!');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleOpenLicenseModal = (
    restaurantId: string,
    license: any,
    licenseType: string,
  ) => {
    setSelectedRestaurantForLicense(restaurantId);
    setExistingLicense(license);
    setSelectedLicenseType(licenseType);
    setLicenseModalVisible(true);
  };

  const handleDeleteLicense = async (
    licenseId: string,
    licenseName: string,
  ) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn xóa ${licenseName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLicense(licenseId);
              Alert.alert('Thành công', 'Đã xóa giấy phép!');
              // Refresh danh sách quán để cập nhật
              fetchVendorIdAndShops();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa giấy phép. Vui lòng thử lại!');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleCloseLicenseModal = () => {
    setLicenseModalVisible(false);
    setSelectedRestaurantForLicense(null);
    setExistingLicense(null);
    // Refresh danh sách quán để cập nhật trạng thái license
    fetchVendorIdAndShops();
  };

  const renderShop = ({ item }: { item: ShopWithLicense }) => {
    // Lấy URL ảnh đầu tiên từ object images
    let imageUrl = '';
    if (item.images && typeof item.images === 'object') {
      const urls = Object.values(item.images) as string[];
      if (urls.length > 0) {
        imageUrl = urls[0];
      }
    }

    // Xác định màu cho trạng thái duyệt
    let statusColor = '#888';
    let statusText = 'Chờ duyệt';
    if (item.approvalStatus === 'APPROVED') {
      statusColor = '#2ecc40';
      statusText = 'Đã duyệt';
    } else if (item.approvalStatus === 'REJECTED') {
      statusColor = '#e74c3c';
      statusText = 'Từ chối';
    } else if (item.approvalStatus === 'PENDING') {
      statusColor = '#f1c40f';
      statusText = 'Chờ duyệt';
    }

    return (
      <View style={styles.shopItem}>
        {/* Hàng trên cùng: trạng thái + menu_dots */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 8,
            left: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              color: statusColor,
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {statusText}
          </Text>
          <TouchableOpacity
            style={{ padding: 4 }}
            onPress={event => {
              const target = event.currentTarget as any;
              if (target && target.measure) {
                target.measure(
                  (
                    x: number,
                    y: number,
                    width: number,
                    height: number,
                    pageX: number,
                    pageY: number,
                  ) => {
                    setMenuPosition({
                      top: pageY,
                      right: 30,
                    });
                    setSelectedShop(item);
                    setModalVisible(true);
                  },
                );
              }
            }}
          >
            <Image
              source={require('../assets/menu_dots.png')}
              style={{ width: 22, height: 22, tintColor: '#444' }}
            />
          </TouchableOpacity>
        </View>
        {/* Nội dung chính */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('VendorDishes', {
              restaurantId: item.restaurantId,
            })
          }
          style={{ flex: 1 }}
        >
          <Text style={styles.shopName}>{item.name}</Text>
          <View style={styles.shopContentRow}>
            <Image source={{ uri: imageUrl }} style={styles.shopIcon} />
            <Text style={styles.shopAddress}>{item.address}</Text>
          </View>
        </TouchableOpacity>

        {/* Nút giấy phép */}
        <View style={{ marginTop: 10, gap: 8 }}>
          {/* Giấy phép kinh doanh */}
          {item.businessLicense ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
                backgroundColor: '#E8F4F8',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#0C516F',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 12, color: '#0C516F', fontWeight: '600' }}
                >
                  Giấy phép kinh doanh
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Số GP: {item.businessLicense.licenseNumber}
                </Text>
                <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                  {item.businessLicense.approvalStatus === 'PENDING'
                    ? 'Chờ duyệt'
                    : item.businessLicense.approvalStatus === 'APPROVED'
                    ? 'Đã duyệt'
                    : 'Từ chối'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() =>
                    handleOpenLicenseModal(
                      item.restaurantId,
                      item.businessLicense,
                      'BUSINESS_REGISTRATION',
                    )
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: '#0C516F',
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
                  >
                    Sửa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteLicense(
                      item.businessLicense!.licenseId,
                      'giấy phép kinh doanh',
                    )
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: '#e74c3c',
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
                  >
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                handleOpenLicenseModal(
                  item.restaurantId,
                  null,
                  'BUSINESS_REGISTRATION',
                )
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                backgroundColor: '#fff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#0C516F',
                borderStyle: 'dashed',
              }}
            >
              <Image
                source={require('../assets/add_image.png')}
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              <Text
                style={{ color: '#0C516F', fontSize: 13, fontWeight: '600' }}
              >
                Thêm giấy phép kinh doanh
              </Text>
            </TouchableOpacity>
          )}

          {/* Giấy phép an toàn vệ sinh thực phẩm */}
          {item.foodSafetyLicense ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
                backgroundColor: '#E8F8F4',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#2ecc40',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 12, color: '#2ecc40', fontWeight: '600' }}
                >
                  Giấy phép ATVS thực phẩm
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  Số GP: {item.foodSafetyLicense.licenseNumber}
                </Text>
                <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
                  {item.foodSafetyLicense.approvalStatus === 'PENDING'
                    ? 'Chờ duyệt'
                    : item.foodSafetyLicense.approvalStatus === 'APPROVED'
                    ? 'Đã duyệt'
                    : 'Từ chối'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() =>
                    handleOpenLicenseModal(
                      item.restaurantId,
                      item.foodSafetyLicense,
                      'FOOD_SAFETY_CERT',
                    )
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: '#2ecc40',
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
                  >
                    Sửa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleDeleteLicense(
                      item.foodSafetyLicense!.licenseId,
                      'giấy phép ATVS thực phẩm',
                    )
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: '#e74c3c',
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}
                  >
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() =>
                handleOpenLicenseModal(
                  item.restaurantId,
                  null,
                  'FOOD_SAFETY_CERT',
                )
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                backgroundColor: '#fff',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#2ecc40',
                borderStyle: 'dashed',
              }}
            >
              <Image
                source={require('../assets/add_image.png')}
                style={{ width: 16, height: 16, marginRight: 6 }}
              />
              <Text
                style={{ color: '#2ecc40', fontSize: 13, fontWeight: '600' }}
              >
                Thêm giấy phép ATVS thực phẩm
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="Đăng ký quán"
        showBack={true}
        onBack={() => navigation.navigate('Drawer')}
      />

      {/* Danh sách quán đã đăng ký */}
      <Text style={styles.sectionTitle}>Quán đã đăng ký</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={item => item.restaurantId}
          renderItem={renderShop}
          style={styles.shopList}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
              Bạn chưa đăng ký quán nào.
            </Text>
          }
        />
      )}

      {/* Modal menu cho từng shop */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: menuPosition.top,
              right: menuPosition.right,
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 16,
              minWidth: 150,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('EditShop', {
                  restaurantId: selectedShop?.restaurantId,
                });
              }}
            >
              <Image
                source={require('../assets/icon_edit.png')}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: '#1E90FF',
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 16, color: '#1E90FF' }}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
              onPress={() => handleDeleteShop(selectedShop)}
            >
              <Image
                source={require('../assets/icon_delete.png')}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: 'red',
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 16, color: 'red' }}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal Upload License */}
      {selectedRestaurantForLicense && (
        <UploadLicenseModal
          visible={licenseModalVisible}
          onClose={handleCloseLicenseModal}
          restaurantId={selectedRestaurantForLicense}
          existingLicense={existingLicense}
          initialLicenseType={selectedLicenseType}
        />
      )}

      {/* Button Thêm quán mới */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('RegisterShop')}
      >
        <Text style={styles.addButtonText}>+ Thêm quán mới</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddShopScreen;
