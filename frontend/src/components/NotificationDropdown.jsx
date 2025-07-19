import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import config from '../config/config.js';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications using config interval
        const interval = setInterval(fetchNotifications, config.NOTIFICATION_POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (!token) return;

            try {
                // Fetch recent notifications and unread count separately
                const notificationsData = await notificationService.getUserNotifications(0, 5, false);
                const unreadCountData = await notificationService.getUnreadCount();
                
                setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
                setUnreadCount(unreadCountData.unread_count || 0);
            } catch (error) {
                console.warn('Notifications not available:', error.message);
                // Set empty states instead of throwing error
                setNotifications([]);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 1: // ANSWER
                return 'bg-blue-100 text-blue-800';
            case 2: // COMMENT
                return 'bg-green-100 text-green-800';
            case 3: // MENTION
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getNotificationTypeText = (type) => {
        switch (type) {
            case 1: return 'Answer';
            case 2: return 'Comment';
            case 3: return 'Mention';
            default: return 'Notification';
        }
    };

    if (!localStorage.getItem(config.TOKEN_KEY)) return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
            >
                <FaBell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.nid}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                        !notification.is_read ? 'bg-blue-50 dark:bg-gray-700' : ''
                                    }`}
                                    onClick={() => {
                                        // Mark as read if unread
                                        if (!notification.is_read) {
                                            markAsRead(notification.nid);
                                        }
                                        // Navigate to related content
                                        if (notification.question_id) {
                                            window.location.href = `/post/${notification.question_id}`;
                                        }
                                        // Close dropdown
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                                                    {getNotificationTypeText(notification.type)}
                                                </span>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{notification.content}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <Link
                            to="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                            View All Notifications
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;