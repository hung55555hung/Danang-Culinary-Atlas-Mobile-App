import { useState, useEffect } from 'react';
import { getRestaurantTags } from '../api/apiConfig';
import { Alert } from 'react-native';

interface Tag {
  tagId: number;
  name: string;
}

export const useRestaurantTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await getRestaurantTags();
      setTags(response.data || []);
      console.log('✅ Tags loaded:', response.data);
    } catch (error) {
      console.error('❌ Error loading tags:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách loại quán');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const isTagSelected = (tagId: number) => selectedTags.includes(tagId);

  return {
    tags,
    selectedTags,
    loading,
    toggleTag,
    isTagSelected,
  };
};
