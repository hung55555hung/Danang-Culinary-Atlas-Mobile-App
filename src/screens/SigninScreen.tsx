import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from '../styles/SigninStyles';
import { useNavigation } from '@react-navigation/native';
import { loginAccount } from '../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { StatusBar } from 'react-native';
export default function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const response = await loginAccount({
        email,
        password,
      });

      const { token, email: userEmail, fullName, roles } = response.data.data;
      console.log('Đăng nhập thành công:', response.data);

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userEmail', userEmail);
      await AsyncStorage.setItem('roles', JSON.stringify(roles));
      navigation.navigate('Drawer');
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập thất bại, vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar hidden={true} animated={true} />
      <View style={styles.container}>
        {/* Header */}
        <Header title="Đăng nhập" showBack={true} />
        <View style={styles.body}>
          {/* Logo */}
          <Image
            source={require('../assets/logo2.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Input Email */}
          <TextInput
            placeholder="Email"
            style={styles.input}
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Input Password */}
          <TextInput
            placeholder="Mật khẩu"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
          />

          {/* Quên mật khẩu */}
          <View style={styles.forgotPasswordWrapper}>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Button Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
