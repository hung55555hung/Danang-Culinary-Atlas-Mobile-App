// import { useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getUserProfile, updateUserProfile } from '../api/apiConfig';

// export interface Profile {
//   name: string;
//   avatarUrl: any;
//   dob: Date | null;
//   phone: string;
//   gender: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }

// export const useProfile = () => {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState<Profile>({
//     name: '',
//     avatarUrl: require('../assets/avt_default.jpg'),
//     dob: null,
//     phone: '',
//     gender: '',
//     email: '',
//     password: '********',
//     confirmPassword: '********',
//   });

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await getUserProfile();
//         const user = response.data.data;

//         setProfile({
//           name: user.fullName || '',
//           avatarUrl:
//             user.avatarUrl && user.avatarUrl !== 'string'
//               ? { uri: user.avatarUrl }
//               : require('../assets/avt_default.jpg'),
//           dob: user.dob ? new Date(user.dob) : null,
//           phone: /^[0-9]/.test(user.phone) ? user.phone : '',
//           gender: user.gender || '',
//           email: user.email || '',
//           password: '********',
//           confirmPassword: '********',
//         });
//       } catch (error) {
//         console.error('Lỗi khi lấy profile:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const savePersonalInfo = async () => {
//     try {
//       const payload = {
//         fullName: profile.name,
//         avatarUrl:
//           typeof profile.avatarUrl === 'string'
//             ? profile.avatarUrl
//             : profile.avatarUrl?.uri || 'string',
//         dob: profile.dob ? profile.dob.toISOString().split('T')[0] : null,
//         phone: profile.phone,
//         gender: profile.gender,
//       };

//       console.log('Cập nhật thông tin cá nhân với payload22:', payload);
//       const res = await updateUserProfile(payload);
//       await AsyncStorage.setItem('fullName', profile.name);
//       await AsyncStorage.setItem('userEmail', profile.email);

//       if (res.status === 200 || res.data?.status === 'success') {
//         Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công!');
//       } else {
//         Alert.alert(
//           '⚠️ Thất bại',
//           res.data?.message || 'Không thể cập nhật thông tin.',
//         );
//       }
//     } catch (error) {
//       console.error('Lỗi cập nhật thông tin:', error);
//     }
//   };

//   const saveSecurityInfo = () => {
//     console.log('Lưu thông tin bảo mật:', profile);
//     // TODO: Gọi API cập nhật email/mật khẩu
//   };

//   return {
//     loading,
//     profile,
//     setProfile,
//     savePersonalInfo,
//     saveSecurityInfo,
//   };
// };

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, updateUserProfile } from '../api/apiConfig';

export interface Profile {
  name: string;
  avatarUrl: any;
  dob: Date | null;
  phone: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    name: '',
    avatarUrl: require('../assets/avt_default.jpg'),
    dob: null,
    phone: '',
    gender: '',
    email: '',
    password: '********',
    confirmPassword: '********',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        const user = response.data.data;

        setProfile({
          name: user.fullName || '',
          avatarUrl:
            user.avatarUrl && user.avatarUrl !== 'string'
              ? { uri: user.avatarUrl }
              : require('../assets/avt_default.jpg'),
          dob: user.dob ? new Date(user.dob) : null,
          phone: /^[0-9]/.test(user.phone) ? user.phone : '',
          gender: user.gender || '',
          email: user.email || '',
          password: '********',
          confirmPassword: '********',
        });
      } catch (error) {
        console.error('Lỗi khi lấy profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Validate personal info
  const validatePersonalInfo = (): boolean => {
    // Check name
    if (!profile.name || profile.name.trim() === '') {
      Alert.alert('⚠️ Lỗi', 'Tên không được để trống');
      return false;
    }

    if (profile.name.trim().length < 2) {
      Alert.alert('⚠️ Lỗi', 'Tên phải có ít nhất 2 ký tự');
      return false;
    }

    // Check phone
    if (!profile.phone || profile.phone.trim() === '') {
      Alert.alert('⚠️ Lỗi', 'Số điện thoại không được đê trống');
      return false;
    }

    // Validate phone format (Vietnam)
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(profile.phone)) {
      Alert.alert('⚠️ Lỗi', 'Số điện thoại không hợp lệ.');
      return false;
    }

    return true;
  };

  const savePersonalInfo = async () => {
    // ✅ Validate trước khi save
    if (!validatePersonalInfo()) {
      return;
    }

    try {
      const payload = {
        fullName: profile.name,
        avatarUrl:
          typeof profile.avatarUrl === 'string'
            ? profile.avatarUrl
            : profile.avatarUrl?.uri || 'string',
        dob: profile.dob ? profile.dob.toISOString().split('T')[0] : null,
        phone: profile.phone,
        gender: profile.gender,
      };

      console.log('Cập nhật thông tin cá nhân với payload:', payload);
      const res = await updateUserProfile(payload);
      await AsyncStorage.setItem('fullName', profile.name);
      await AsyncStorage.setItem('userEmail', profile.email);

      if (res.status === 200 || res.data?.status === 'success') {
        Alert.alert('✅ Thành công', 'Cập nhật thông tin cá nhân thành công!');
      } else {
        Alert.alert(
          '⚠️ Thất bại',
          res.data?.message || 'Không thể cập nhật thông tin.',
        );
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
    }
  };

  const saveSecurityInfo = () => {
    console.log('Lưu thông tin bảo mật:', profile);
    // TODO: Gọi API cập nhật email/mật khẩu
  };

  return {
    loading,
    profile,
    setProfile,
    savePersonalInfo,
    saveSecurityInfo,
  };
};
