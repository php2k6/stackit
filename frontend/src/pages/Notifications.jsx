import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Modal, Avatar } from 'flowbite-react';
import { BellIcon, CheckIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import notificationService from '../services/notificationService';
import { toast } from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getUserNotifications(0, 50, false);
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load notifications');
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count.unread_count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
            setUnreadCount(0);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(notif => 
                notif.nid === notificationId ? { ...notif, is_read: true } : notif
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(notifications.filter(notif => notif.nid !== notificationId));
            if (!notifications.find(n => n.nid === notificationId)?.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'answer':
                return '💬';
            case 'comment':
                return '💭';
            case 'vote':
                return '👍';
            case 'accepted':
                return '✅';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'answer':
                return 'bg-blue-100 text-blue-800';
            case 'comment':
                return 'bg-green-100 text-green-800';
            case 'vote':
                return 'bg-orange-100 text-orange-800';
            case 'accepted':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const openDetailModal = (notification) => {
        setSelectedNotification(notification);
        setDetailModalOpen(true);
        if (!notification.is_read) {
            markAsRead(notification.nid);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <BellIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600">
                                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    
                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} size="sm">
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Card 
                                key={notification.nid} 
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    !notification.is_read ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div 
                                        className="flex items-start space-x-4 flex-1"
                                        onClick={() => openDetailModal(notification)}
                                    >
                                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <Badge color="blue" size="xs">New</Badge>
                                                )}
                                            </div>
                                            
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {notification.message}
                                            </p>
                                            
                                            <p className="text-gray-500 text-xs mt-2">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 ml-4">
                                        <Button
                                            size="xs"
                                            color="blue"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDetailModal(notification);
                                            }}
                                        >
                                            <EyeIcon className="w-3 h-3" />
                                        </Button>
                                        
                                        {!notification.is_read && (
                                            <Button
                                                size="xs"
                                                color="success"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.nid);
                                                }}
                                            >
                                                <CheckIcon className="w-3 h-3" />
                                            </Button>
                                        )}
                                        
                                        <Button
                                            size="xs"
                                            color="failure"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.nid);
                                            }}
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="text-center py-12">
                            <BellIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
                        </Card>
                    )}
                </div>

                {/* Notification Detail Modal */}
                <Modal show={detailModalOpen} onClose={() => setDetailModalOpen(false)} size="lg">
                    <Modal.Header>
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                                {selectedNotification && getNotificationIcon(selectedNotification.type)}
                            </span>
                            <span>Notification Details</span>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedNotification && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {selectedNotification.title}
                                    </h3>
                                    <Badge color="blue" size="sm" className="mb-4">
                                        {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                                    </Badge>
                                </div>
                                
                                <div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {selectedNotification.message}
                                    </p>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        <strong>Received:</strong> {formatDate(selectedNotification.created_at)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <strong>Status:</strong> {selectedNotification.is_read ? 'Read' : 'Unread'}
                                    </p>
                                    {selectedNotification.related_id && (
                                        <p className="text-sm text-gray-500">
                                            <strong>Related ID:</strong> {selectedNotification.related_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex justify-between w-full">
                            <div className="space-x-2">
                                {selectedNotification && !selectedNotification.is_read && (
                                    <Button
                                        size="sm"
                                        color="success"
                                        onClick={() => {
                                            markAsRead(selectedNotification.nid);
                                            setDetailModalOpen(false);
                                        }}
                                    >
                                        <CheckIcon className="w-4 h-4 mr-2" />
                                        Mark as Read
                                    </Button>
                                )}
                                
                                <Button
                                    size="sm"
                                    color="failure"
                                    onClick={() => {
                                        deleteNotification(selectedNotification.nid);
                                        setDetailModalOpen(false);
                                    }}
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                            
                            <Button
                                size="sm"
                                color="gray"
                                onClick={() => setDetailModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Notifications;
