import axios from 'axios';
import config from '../config/config.js';

class AdminService {
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

    // Get all users (admin only)
    async getAllUsers(skip = 0, limit = 100) {
        try {
            const response = await this.api.get('/user/all', {
                params: { skip, limit }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch users');
        }
    }

    // Delete user (admin only)
    async deleteUser(username) {
        try {
            const response = await this.api.delete(`/user/${username}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete user');
        }
    }

    // Get home stats
    async getHomeStats() {
        try {
            const response = await this.api.get('/home/stats');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch stats');
        }
    }

    // Get trending tags
    async getTrendingTags(limit = 10) {
        try {
            const response = await this.api.get('/home/trending-tags', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch trending tags');
        }
    }

    // Delete question (admin only)
    async deleteQuestion(qid) {
        try {
            const response = await this.api.delete(`/question/${qid}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete question');
        }
    }

    // Delete answer (admin only)
    async deleteAnswer(aid) {
        try {
            const response = await this.api.delete(`/answer/${aid}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete answer');
        }
    }
}

export default new AdminService();
