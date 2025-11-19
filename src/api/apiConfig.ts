import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRole } from '../utils/auth';

const API = axios.create({
  baseURL: 'https://danangculinaryatlas.site/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  async config => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (e) {
    console.error('Không thể lấy token:', e);
    return null;
  }
};

export const registerAccount = async (data: {
  email: string;
  password: string;
  role: string;
}) => {
  return API.post('/auth/signup', data);
};

export const loginAccount = async (data: {
  email: string;
  password: string;
}) => {
  return API.post('/auth/login', data);
};

export const getUserProfile = async () => {
  return API.get(`/profile/${await getRole()}`);
};

export const updateUserProfile = async (data: {
  fullName: string;
  avatarUrl?: string;
  dob?: string | null;
  phone?: string;
  gender?: string;
}) => {
  console.log('Cập nhật thông tin cá nhân với payload:', data);
  return API.put(`/profile/${await getRole()}`, data);
};

export const getRestaurants = async (zoomLevel: number) => {
  return API.get(`/restaurants/map-view?zoomLevel=${zoomLevel}`);
};

export const getRestaurantReviews = async (
  restaurantId: string,
  page = 0,
  size = 10,
) => {
  return API.get(
    `/restaurants/${restaurantId}/reviews?page=${page}&size=${size}&sortBy=createdAt&sortDirection=desc`,
  );
};

export const getProvinces = () => API.get('/locations/provinces');

export const getDistrictsByProvince = (provinceId: number) =>
  API.get(`/locations/provinces/${provinceId}/districts`);

export const getWardsByDistrict = (districtId: number) =>
  API.get(`/locations/districts/${districtId}/wards`);

export const createRestaurant = async (data: {
  name: string;
  address: string;
  wardId: number;
  latitude: number;
  longitude: number;
  tagIds: number[];
  openingHours: {
    [key: string]: string;
  };
  images: { [key: string]: string };
}) => {
  return API.put('/restaurants', data);
};

export const createReview = async (data: {
  comment: string;
  rating: number;
  restaurantId: string;
  images: string[];
}) => {
  return API.post('/reviews', data);
};

export const getNotifications = async () => {
  return API.get('/notifications');
};

export const getRestaurantById = (restaurantId: string) => {
  return API.get(`/restaurants/${restaurantId}`);
};

export const requestPasswordReset = async (data: {
  email: string;
  platform: 'mobile';
}) => {
  return API.post('/auth/forgot-password', data);
};

export const getRestaurantTags = async () => {
  return API.get('/tags/restaurant');
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await API.put('/auth/change-password', payload);
  return response.data;
};

export const getVendorRestaurants = async (vendorId: string) => {
  const res = await API.get(`/vendors/${vendorId}/restaurants`);
  return res.data.content;
};

export const deleteRestaurant = async (restaurantId: string) => {
  const res = await API.delete(`/restaurants/${restaurantId}`);
  return res.data;
};

export const getVendorDishes = async (restaurantId: string) => {
  const res = await API.get(`/restaurants/${restaurantId}/vendor-dishes`);
  return res.data.content;
};

export const createDish = async (data: {
  restaurantId: string;
  name: string;
  images: string[];
  description: string;
  price: number;
  status: string;
}) => {
  const res = await API.post('/dishes', data);
  return res.data;
};
export const getDishesOfRestaurant = async (restaurantId: string) => {
  const res = await API.get(`/restaurants/${restaurantId}/dishes`);
  return res.data.content;
};

export default API;
