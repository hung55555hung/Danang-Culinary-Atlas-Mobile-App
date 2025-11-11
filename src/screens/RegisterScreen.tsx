import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import styles from '../styles/SigninStyles';
import { registerAccount } from '../api/apiConfig';
import Header from '../components/Header';
import { StatusBar } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [modalVisible, setModalVisible] = useState(false);

  // Danh sách role cho chọn
  const roles = [
    { label: 'Người dùng', value: 'USER' },
    { label: 'Chủ quán', value: 'VENDOR' },
    { label: 'Quản trị viên', value: 'ADMIN' },
  ];

  // Hàm xử lý đăng ký
  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      const response = await registerAccount({
        email,
        password,
        role,
      });

      const resData = response.data;

      if (resData.status === 'success') {
        Alert.alert('Thành công', resData.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Signin'),
          },
        ]);
      } else {
        Alert.alert('Lỗi', resData.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể đăng ký, thử lại sau',
      );
    }
  };

  return (
    <>
      <StatusBar hidden={true} animated={true} />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <Header title="Đăng ký" showBack={true} />
          <View style={styles.body}>
            {/* Logo */}
            <Image
              source={require('../assets/logo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Input Email */}
            <TextInput
              testID="input-email"
              accessibilityLabel="input-email"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Input Password */}
            <TextInput
              testID="input-password"
              accessibilityLabel="input-password"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#666"
            />

            {/* Input Confirm Password */}
            <TextInput
              testID="input-confirm-password"
              accessibilityLabel="input-confirm-password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#666"
            />

            {/* Dropdown chọn Role */}
            <TouchableOpacity
              testID="dropdown-role"
              accessibilityLabel="dropdown-role"
              style={[
                styles.input,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: '#333', fontSize: 16 }}>
                {role === 'USER'
                  ? 'Người dùng'
                  : role === 'VENDOR'
                  ? 'Chủ quán'
                  : 'Quản trị viên'}
              </Text>
              <Image
                source={require('../assets/drop_d.png')}
                style={{ width: 20, height: 20, tintColor: '#666' }}
              />
            </TouchableOpacity>

            {/* Button Register */}
            <TouchableOpacity
              testID="button-register"
              accessibilityLabel="button-register"
              style={styles.loginButton}
              onPress={handleRegister}
            >
              <Text style={styles.loginText}>Đăng ký</Text>
            </TouchableOpacity>

            {/* Modal chọn Role */}
            <Modal visible={modalVisible} animationType="slide" transparent>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'white',
                    width: '80%',
                    borderRadius: 10,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: 18,
                      marginBottom: 10,
                    }}
                  >
                    Chọn vai trò
                  </Text>

                  <FlatList
                    data={roles}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        testID={`role-${item.value}`}
                        accessibilityLabel={`role-${item.value}`}
                        onPress={() => {
                          setRole(item.value);
                          setModalVisible(false);
                        }}
                        style={{
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderColor: '#eee',
                        }}
                      >
                        <Text style={{ textAlign: 'center', fontSize: 16 }}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{ padding: 12 }}
                  >
                    <Text style={{ textAlign: 'center', color: 'red' }}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
