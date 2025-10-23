// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ScrollView,
// } from 'react-native';
// import styles from '../styles/RegisterShopStyles';
// import { useNavigation } from '@react-navigation/native';
// export default function RegisterShopScreen() {
//   const navigation = useNavigation<any>();

//   const [city, setCity] = useState('');
//   const [district, setDistrict] = useState('');
//   const [ward, setWard] = useState('');

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Thanh tiêu đề */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Image
//             source={require('../assets/icon_back.png')}
//             style={styles.backArrow}
//           />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Đăng ký quán</Text>
//       </View>

//       {/* Dropdown chọn địa chỉ */}
//       <TouchableOpacity style={styles.dropdown}>
//         <Text style={styles.dropdownText}>{city || 'Thành phố'}</Text>
//         <Image
//           source={require('../assets/drop_d.png')}
//           style={styles.backArrow}
//         />
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.dropdown}>
//         <Text style={styles.dropdownText}>{district || 'Quận/Huyện'}</Text>
//         <Image
//           source={require('../assets/drop_d.png')}
//           style={styles.backArrow}
//         />
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.dropdown}>
//         <Text style={styles.dropdownText}>{ward || 'Phường/Xã'}</Text>
//         <Image
//           source={require('../assets/drop_d.png')}
//           style={styles.backArrow}
//         />
//       </TouchableOpacity>

//       {/* Ô nhập liệu */}
//       <TextInput
//         style={styles.input}
//         placeholder="Tên quán *"
//         placeholderTextColor="#555"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Số nhà và đường phố *"
//         placeholderTextColor="#555"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Số điện thoại liên hệ *"
//         placeholderTextColor="#555"
//         keyboardType="phone-pad"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Giờ hoạt động"
//         placeholderTextColor="#555"
//       />

//       {/* Nút thêm ảnh */}
//       <TouchableOpacity style={styles.uploadButton}>
//         <Image
//           source={require('../assets/add_image.png')}
//           style={styles.uploadIcon}
//         />
//         <Text style={styles.uploadText}>Thêm ảnh và video</Text>
//       </TouchableOpacity>

//       {/* Nút đăng ký */}
//       <TouchableOpacity style={styles.submitButton}>
//         <Text style={styles.submitButtonText}>＋ Đăng ký quán</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

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
} from 'react-native';
import axios from 'axios';
import styles from '../styles/RegisterShopStyles';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

export default function RegisterShopScreen() {
  const navigate = useNavigation<any>();

  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [city, setCity] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);
  const [ward, setWard] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'district' | 'ward'>(
    'city',
  );

  // 🔹 Gọi API danh sách tỉnh/thành khi mở màn hình
  useEffect(() => {
    axios
      .get('https://provinces.open-api.vn/api/p/')
      .then(res => setCities(res.data))
      .catch(err => console.log(err));
  }, []);

  // 🔹 Khi chọn tỉnh thì gọi API lấy danh sách quận
  const handleSelectCity = async (item: any) => {
    setCity(item);
    setDistrict(null);
    setWard(null);
    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${item.code}?depth=2`,
    );
    setDistricts(res.data.districts);
    setModalVisible(false);
  };

  // 🔹 Khi chọn quận thì gọi API lấy danh sách phường
  const handleSelectDistrict = async (item: any) => {
    setDistrict(item);
    setWard(null);
    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${item.code}?depth=2`,
    );
    setWards(res.data.wards);
    setModalVisible(false);
  };

  const handleSelectWard = (item: any) => {
    setWard(item);
    setModalVisible(false);
  };

  // 🔹 Hàm mở modal theo loại
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
        />
        <TextInput
          style={styles.input}
          placeholder="Số nhà và đường *"
          placeholderTextColor="#555"
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
        />

        {/* Nút thêm ảnh */}
        <TouchableOpacity style={styles.uploadButton}>
          <Image
            source={require('../assets/add_image.png')}
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadText}>Thêm ảnh và video</Text>
        </TouchableOpacity>

        {/* Nút đăng ký */}
        <TouchableOpacity style={styles.submitButton}>
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
