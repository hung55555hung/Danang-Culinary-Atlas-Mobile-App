import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRole } from '../utils/auth';
import { rest } from 'lodash';

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

export const getWardById = (wardId: number) =>
  API.get(`/locations/wards/${wardId}`);

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
  return API.post('/restaurants', data);
};

export const createReview = async (data: {
  comment: string;
  rating: number;
  restaurantId: string;
  images: string[];
}) => {
  return API.post('/reviews', data);
};

export const updateReview = async (
  reviewId: string,
  data: {
    rating: number;
    comment: string;
    images: string[];
  },
) => {
  return API.patch(`/reviews/${reviewId}`, data);
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

export const getTagsByRestaurantId = async (restaurantId: string) => {
  return API.get(`/tags/restaurant/${restaurantId}`);
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

export const getRestaurantDetail = (restaurantId: string) => {
  return API.get(`/restaurants/${restaurantId}`);
};

export const updateDish = async (
  dishId: string,
  data: {
    name?: string;
    images?: string[];
    description?: string;
    price?: number;
    status?: string;
  },
) => {
  console.log('Updating dish with data:', data);
  const res = await API.patch(`/dishes/${dishId}`, data);
  return res.data;
};

export const resetPassword = async (data: {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}) => {
  return API.post('/auth/reset-password', data);
};

export const createReport = async (data: {
  restaurantId?: string;
  dishId?: string;
  reviewId?: string;
  reason: string;
}) => {
  return API.post('/reports', data);
};

export const getRecommendations = async (data: {
  hour: number;
  k: number;
  target_type: 'restaurant' | 'dish';
  user_id: string;
}) => {
  return axios.post(
    'https://iloveuhiuhiu-danang-food-recsys.hf.space/api/v1/recommend',
    data,
  );
};

export const deleteReview = async (reviewId: string) => {
  try {
    const response = await API.delete(`/reviews/${reviewId}`);
    return response;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const replyToReview = async (reviewId: string, vendorReply: string) => {
  try {
    const response = await API.post(`/reviews/${reviewId}/reply`, {
      vendorReply,
    });
    return response;
  } catch (error) {
    console.error('Error replying to review:', error);
    throw error;
  }
};

export const searchRestaurantsUnified = async (params: {
  keyword?: string;
  dishName?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) => {
  const {
    keyword = '',
    dishName = '',
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDirection = 'desc',
  } = params;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append('keyword', keyword);
  if (dishName) queryParams.append('dishName', dishName);
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  queryParams.append('sortBy', sortBy);
  queryParams.append('sortDirection', sortDirection);

  return API.get(`/restaurants/search_unified?${queryParams.toString()}`);
};

// Upload giấy phép kinh doanh
export const uploadLicense = async (data: {
  restaurantId: string;
  licenseType: string;
  licenseNumber: string;
  issueDate: string;
  expireDate: string;
  documentUrl: string;
}) => {
  return API.post('/licenses', data);
};

export default API;
