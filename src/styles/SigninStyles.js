import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#63C7C6', // màu nền xanh nhạt
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
  },
  forgotPasswordWrapper: {
    width: '100%', // để full chiều ngang
    alignItems: 'flex-end', // đẩy text sang bên phải
    marginBottom: 30,
  },
  forgotPassword: {
    color: '#0B3954',
    fontSize: 14,
  },

  loginButton: {
    width: '100%',
    backgroundColor: '#0B3954', // xanh đậm
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
