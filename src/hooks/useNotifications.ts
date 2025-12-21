import { useEffect, useState } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '../api/apiConfig';

interface Notification {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (
    page: number = 0,
    append: boolean = false,
  ) => {
    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getNotifications(page, 10);
      const newNotifications = res.data.content || [];

      if (append) {
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setCurrentPage(page);
      setTotalPages(res.data.totalPages || 0);
      setHasMore(page < res.data.totalPages - 1);
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        ),
      );
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const removeNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.notificationId !== notificationId),
      );
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchNotifications(0, false);
  }, []);

  return {
    notifications,
    loading,
    loadingMore,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    removeNotification,
  };
};
