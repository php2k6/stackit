import axios from 'axios';
import config from '../config/config.js';

class NotificationService {
    constructor() {
        this.api = axios.create({
            baseURL: config.API_BASE_URL,
            timeout: config.REQUEST_TIMEOUT,
        });

        // Add token to requests automatically
        this.api.interceptors.request.use((axiosConfig) => {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (token) {
                axiosConfig.headers.Authorization = `Bearer ${token}`;
            }
            return axiosConfig;
        });
    }

    // Get user notifications
    async getUserNotifications(skip = 0, limit = 20, unreadOnly = false) {
        try {
            const params = {
                skip: skip,
                limit: limit
            };
            
            // Only add unread_only if it's true to avoid the 422 error
            if (unreadOnly) {
                params.unread_only = true;
            }
            
            const response = await this.api.get('/notification/', {
                params: params
            });
            return response.data.notifications || response.data || [];
        } catch (error) {
            console.error('Notification API error:', error.response?.data);
            throw new Error(error.response?.data?.detail || 'Failed to fetch notifications');
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const response = await this.api.post('/notification/read', {
                notification_id: notificationId
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to mark notification as read');
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        try {
            const response = await this.api.post('/notification/read-all');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to mark all notifications as read');
        }
    }

    // Get unread count
    async getUnreadCount() {
        try {
            const response = await this.api.get('/notification/', {
                params: { 
                    unread_only: true,
                    limit: 1000
                }
            });
            return {
                unread_count: response.data.unread_count || (response.data.notifications ? response.data.notifications.length : 0)
            };
        } catch (error) {
            console.error('Unread count API error:', error.response?.data);
            // Return 0 if there's an error to prevent app breaking
            return { unread_count: 0 };
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await this.api.delete(`/notification/${notificationId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete notification');
        }
    }
}

export default new NotificationService();
