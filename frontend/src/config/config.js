// Application configuration
const config = {
    // API Configuration
    API_BASE_URL: 'http://127.0.0.1:8000/api',
    
    // Authentication Configuration
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    USERNAME_KEY: 'username',
    IS_LOGGED_IN_KEY: 'isLoggedIn',
    
    // Application Settings
    DEFAULT_ITEMS_PER_PAGE: 10,
    NOTIFICATION_POLL_INTERVAL: 30000, // 30 seconds
    
    // UI Configuration
    TOAST_DURATION: 3000,
    DEFAULT_AVATAR_API: 'https://ui-avatars.com/api/',
    
    // Request Configuration
    REQUEST_TIMEOUT: 10000, // 10 seconds
    
    // Pagination
    DEFAULT_SKIP: 0,
    DEFAULT_LIMIT: 100,
    
    // File Upload (if needed in future)
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    
    // Environment
    NODE_ENV: import.meta.env.MODE || 'development',
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',
};

export default config;
