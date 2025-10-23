import axios from 'axios';

const API = axios.create({
  baseURL: 'http://178.128.208.78:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

//Hàm đăng ký tài khoản
export const registerAccount = async (data: {
  email: string;
  password: string;
  role: string;
}) => {
  return API.post('/auth/signup', data);
};

//Hàm đăng nhập
export const loginAccount = async (data: {
  email: string;
  password: string;
}) => {
  return API.post('/auth/login', data);
};

export default API;
