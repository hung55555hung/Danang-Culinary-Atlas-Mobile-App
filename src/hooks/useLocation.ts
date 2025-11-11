import { useState, useEffect } from 'react';
import {
  getProvinces,
  getDistrictsByProvince,
  getWardsByDistrict,
} from '../api/apiConfig';

export const useLocation = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await getProvinces();
      const formatted = res.data.map((item: any) => ({
        name: item.name,
        code: item.provinceId,
      }));
      setCities(formatted);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tỉnh:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const res = await getDistrictsByProvince(provinceId);
      const formatted = res.data.map((item: any) => ({
        name: item.name,
        code: item.districtId,
      }));
      setDistricts(formatted);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quận:', error);
    }
  };

  const fetchWards = async (districtId: number) => {
    try {
      const res = await getWardsByDistrict(districtId);
      const formatted = res.data.map((item: any) => ({
        name: item.name,
        code: item.wardId,
      }));
      setWards(formatted);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phường:', error);
    }
  };

  return {
    cities,
    districts,
    wards,
    fetchDistricts,
    fetchWards,
    loading,
  };
};
