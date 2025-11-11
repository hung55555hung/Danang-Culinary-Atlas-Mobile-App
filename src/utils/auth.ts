import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserFullName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('fullName');
  } catch (error) {
    console.error('Lỗi khi đọc fullName:', error);
    return null;
  }
};

export const getUserEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userEmail');
  } catch (error) {
    console.error('Lỗi khi đọc email:', error);
    return null;
  }
};

export const getRole = async () => {
  try {
    return (await AsyncStorage.getItem('roles')) || null;
  } catch (e) {
    console.error('Không thể lấy role:', e);
    return null;
  }
};
