import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { requestPasswordReset } from '../api/apiConfig';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập email của bạn');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset({
        email: email,
        platform: 'mobile',
      });
      Alert.alert(
        'Thành công',
        'Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          'Không thể gửi yêu cầu. Vui lòng thử lại sau!',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image
            source={require('../assets/icon_back.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
      </View>

      {/* Icon ổ khóa */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/forgot_password.png')}
          style={styles.lockImage}
        />
      </View>

      {/* Hướng dẫn */}
      <Text style={styles.instruction}>
        Hãy nhập email của bạn để thay đổi mật khẩu
      </Text>

      {/* Ô nhập email */}
      <TextInput
        style={styles.input}
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Nút gửi */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi yêu cầu</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#004c6d',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#004c6d',
    marginRight: 27, // để căn giữa do có nút back
  },
  imageContainer: {
    marginTop: 90,
    marginBottom: 30,
  },
  lockImage: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  instruction: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#004c6d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
