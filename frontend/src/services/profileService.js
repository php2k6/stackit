import axios from 'axios';
import config from '../config/config.js';

class ProfileService {
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

    // Get current user profile
    async getMyProfile() {
        try {
            const response = await this.api.get('/user/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch profile');
        }
    }

    // Get public user profile
    async getProfile(username) {
        try {
            const response = await this.api.get(`/user/${username}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'User not found');
        }
    }

    // Get user profile by username (alias for getProfile)
    async getUserProfile(username) {
        return this.getProfile(username);
    }

    // Get user statistics
    async getUserStats(username) {
        try {
            // Get user data which already includes questions, answers, comments, upvotes arrays
            const user = await this.getMyProfile();
            
            // Calculate basic stats from the existing data
            const totalQuestions = user.questions ? user.questions.length : 0;
            const totalAnswers = user.answers ? user.answers.length : 0;
            const totalComments = user.comments ? user.comments.length : 0;
            const totalUpvotes = user.upvotes ? user.upvotes.length : 0;

            return {
                total_questions: totalQuestions,
                total_answers: totalAnswers,
                total_comments: totalComments,
                total_upvotes: totalUpvotes,
                reputation: totalUpvotes * 10 // Basic reputation calculation
            };
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch user stats');
        }
    }

    // Get user's questions
    async getUserQuestions(username) {
        try {
            // Get user data which already includes questions array
            const user = await this.getMyProfile();
            return user.questions || [];
        } catch (error) {
            console.error('Error fetching user questions:', error);
            // If the endpoint doesn't exist, return empty array
            return [];
        }
    }

    // Get user's answers
    async getUserAnswers(username) {
        try {
            // Get user data which already includes answers array
            const user = await this.getMyProfile();
            return user.answers || [];
        } catch (error) {
            console.error('Error fetching user answers:', error);
            // If the endpoint doesn't exist, return empty array
            return [];
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await this.api.put('/user/me', {
                full_name: profileData.fullName,
                bio: profileData.bio,
                location: profileData.location,
                website: profileData.website
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to update profile');
        }
    }
}

export default new ProfileService();
