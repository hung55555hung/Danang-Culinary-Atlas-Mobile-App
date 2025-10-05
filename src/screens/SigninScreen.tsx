import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import styles from '../styles/SigninStyles';

export default function SigninScreen() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/logo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Input Username */}
      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        placeholderTextColor="#666"
      />

      {/* Input Password */}
      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      {/* Quên mật khẩu */}
      <View style={styles.forgotPasswordWrapper}>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>

      {/* Button Login */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}
