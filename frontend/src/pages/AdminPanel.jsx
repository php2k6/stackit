import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal, Tabs, Avatar } from 'flowbite-react';
import { TrashIcon, UserIcon, QuestionMarkCircleIcon, ChatBubbleLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import adminService from '../services/adminService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [trendingTags, setTrendingTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Admin Panel: Component mounted, starting data fetch...');
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        console.log('Admin Panel: Starting fetchAdminData...');
        setLoading(true);
        
        try {
            // Direct API call to test
            const token = localStorage.getItem(config.TOKEN_KEY);
            console.log('Admin Panel: Token exists:', !!token);
            
            if (!token) {
                console.log('Admin Panel: No token, using mock data');
                setUsers([
                    {
                        id: 1,
                        uid: 1,
                        username: 'admin',
                        email: 'admin@example.com',
                        type: true,
                        created_at: new Date().toISOString(),
                        is_active: true
                    },
                    {
                        id: 2,
                        uid: 2,
                        username: 'user1',
                        email: 'user1@example.com',
                        type: false,
                        created_at: new Date().toISOString(),
                        is_active: true
                    }
                ]);
                setStats({ total_users: 2, total_questions: 5, total_answers: 10, total_views: 50 });
                setTrendingTags([{ tag: 'javascript', count: 15 }, { tag: 'react', count: 12 }]);
                setLoading(false);
                return;
            }

            // Try the actual API call
            console.log('Admin Panel: Making API call to /user/all...');
            const usersResponse = await adminService.getAllUsers();
            console.log('Admin Panel: Raw API response:', usersResponse);
            
            // Handle different response structures
            let usersData = [];
            if (Array.isArray(usersResponse)) {
                // If response is directly an array
                usersData = usersResponse;
            } else if (usersResponse.users && Array.isArray(usersResponse.users)) {
                // If response has users property
                usersData = usersResponse.users;
            } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
                // If response has data property
                usersData = usersResponse.data;
            } else {
                console.warn('Admin Panel: Unexpected response structure:', usersResponse);
                usersData = [];
            }
            
            console.log('Admin Panel: Processed users data:', usersData);
            setUsers(usersData);
            
            // Set default stats for now
            setStats({ 
                total_users: usersData.length, 
                total_questions: 5, 
                total_answers: 10, 
                total_views: 50 
            });
            setTrendingTags([
                { tag: 'javascript', count: 15 }, 
                { tag: 'react', count: 12 }
            ]);
            
        } catch (error) {
            console.error('Admin Panel: Error in fetchAdminData:', error);
            toast.error(`API Error: ${error.message}`);
            
            // Fallback to mock data
            setUsers([
                {
                    id: 1,
                    uid: 1,
                    username: 'mock_admin',
                    email: 'admin@mock.com',
                    type: true,
                    created_at: new Date().toISOString(),
                    is_active: true
                },
                {
                    id: 2,
                    uid: 2,
                    username: 'mock_user',
                    email: 'user@mock.com',
                    type: false,
                    created_at: new Date().toISOString(),
                    is_active: true
                }
            ]);
            setStats({ total_users: 2, total_questions: 3, total_answers: 5, total_views: 25 });
            setTrendingTags([{ tag: 'error', count: 1 }]);
        } finally {
            setLoading(false);
            console.log('Admin Panel: fetchAdminData completed');
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete.username);
            setUsers(users.filter(user => user.username !== userToDelete.username));
            setDeleteModalOpen(false);
            setUserToDelete(null);
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Failed to delete user');
            console.error('Error deleting user:', error);
        }
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="xl" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    // Always render the admin panel content for debugging
    console.log('Admin Panel: About to render, users length:', users.length);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Manage users, content, and view system statistics</p>
                    
                    {/* Debug information */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Debug: Users loaded: {users.length}, Stats: {stats ? 'Yes' : 'No'}, Loading: {loading ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                                    <UserIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Total Users</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                                    <QuestionMarkCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_questions}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Total Questions</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900 mr-4">
                                    <ChatBubbleLeftIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_answers}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Total Answers</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                                    <EyeIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_views}</p>
                                    <p className="text-gray-600 dark:text-gray-300">Total Views</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <Tabs>
                                <Tabs.Item active title="Users Management">
                                    <div className="overflow-x-auto">
                                        <Table className="dark:bg-gray-800">
                                            <Table.Head className="dark:bg-gray-700">
                                                <Table.HeadCell className="dark:text-gray-200">User</Table.HeadCell>
                                                <Table.HeadCell className="dark:text-gray-200">Email</Table.HeadCell>
                                                <Table.HeadCell className="dark:text-gray-200">Role</Table.HeadCell>
                                                <Table.HeadCell className="dark:text-gray-200">Joined</Table.HeadCell>
                                                <Table.HeadCell className="dark:text-gray-200">Status</Table.HeadCell>
                                                <Table.HeadCell>Actions</Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body className="divide-y dark:divide-gray-700">
                                                {users.map((user) => (
                                                    <Table.Row key={user.id} className="bg-white dark:bg-gray-800 dark:border-gray-700">
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            <div className="flex items-center">
                                                                <Avatar
                                                                    img={user.profile_path || `https://ui-avatars.com/api/?name=${user.username}`}
                                                                    alt={user.username}
                                                                    size="sm"
                                                                    rounded
                                                                    className="mr-3"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">@{user.username}</p>
                                                                </div>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className="text-gray-900 dark:text-gray-300">{user.email}</Table.Cell>
                                                        <Table.Cell>
                                                            <Badge color={user.type ? "warning" : "gray"}>
                                                                {user.type ? "Admin" : "User"}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell className="text-gray-900 dark:text-gray-300">{formatDate(user.joined_since || user.created_at)}</Table.Cell>
                                                        <Table.Cell>
                                                            <Badge color="success">
                                                                Active
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="xs"
                                                                    color="blue"
                                                                    onClick={() => setSelectedUser(user)}
                                                                >
                                                                    <EyeIcon className="w-3 h-3" />
                                                                </Button>
                                                                {!user.type && (
                                                                    <Button
                                                                        size="xs"
                                                                        color="failure"
                                                                        onClick={() => openDeleteModal(user)}
                                                                    >
                                                                        <TrashIcon className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </Table>
                                    </div>
                                </Tabs.Item>

                                <Tabs.Item title="Content Management">
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Content management features coming soon...</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            This will include question moderation, answer management, and content review tools.
                                        </p>
                                    </div>
                                </Tabs.Item>

                                <Tabs.Item title="System Logs">
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">System logs coming soon...</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            This will include user activity logs, system events, and audit trails.
                                        </p>
                                    </div>
                                </Tabs.Item>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Tags */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trending Tags</h3>
                            <div className="space-y-2">
                                {trendingTags.slice(0, 10).map((tag, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <Badge color="blue" size="sm">
                                            {tag.tag}
                                        </Badge>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">{tag.count} questions</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button size="sm" className="w-full">
                                    Backup Database
                                </Button>
                                <Button size="sm" color="warning" className="w-full">
                                    Clear Cache
                                </Button>
                                <Button size="sm" color="gray" className="w-full">
                                    Export Data
                                </Button>
                            </div>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">New user registered</span>
                                    <span className="text-gray-500 dark:text-gray-500">2 min ago</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Question deleted</span>
                                    <span className="text-gray-500 dark:text-gray-500">5 min ago</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">User reported content</span>
                                    <span className="text-gray-500 dark:text-gray-500">10 min ago</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Delete User Modal */}
                <Modal show={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} className="dark:bg-gray-800">
                    <Modal.Header className="dark:bg-gray-800 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white">Delete User</span>
                    </Modal.Header>
                    <Modal.Body className="dark:bg-gray-800">
                        <div className="text-center">
                            <TrashIcon className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-500" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete user <strong className="text-gray-700 dark:text-gray-300">{userToDelete?.username}</strong>?
                            </h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                                This action cannot be undone. All of the user's questions, answers, and comments will be deleted.
                            </p>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="dark:bg-gray-800 dark:border-gray-700">
                        <Button color="failure" onClick={handleDeleteUser}>
                            Yes, delete user
                        </Button>
                        <Button color="gray" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* User Details Modal */}
                {selectedUser && (
                    <Modal show={!!selectedUser} onClose={() => setSelectedUser(null)} size="lg" className="dark:bg-gray-800">
                        <Modal.Header className="dark:bg-gray-800 dark:border-gray-700">
                            <span className="text-gray-900 dark:text-white">User Details</span>
                        </Modal.Header>
                        <Modal.Body className="dark:bg-gray-800">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar
                                        img={selectedUser.avatar_url}
                                        alt={selectedUser.username}
                                        size="lg"
                                        rounded
                                    />
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedUser.full_name || selectedUser.username}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">@{selectedUser.username}</p>
                                        <p className="text-gray-500 dark:text-gray-500">{selectedUser.email}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">User ID:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{selectedUser.uid}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Status:</p>
                                        <Badge color={selectedUser.is_active ? "success" : "failure"}>
                                            {selectedUser.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Role:</p>
                                        <Badge color={selectedUser.type ? "warning" : "gray"}>
                                            {selectedUser.type ? "Admin" : "User"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Joined:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{formatDate(selectedUser.created_at)}</p>
                                    </div>
                                </div>

                                {selectedUser.bio && (
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Bio:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{selectedUser.bio}</p>
                                    </div>
                                )}

                                {selectedUser.location && (
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Location:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{selectedUser.location}</p>
                                    </div>
                                )}

                                {selectedUser.website && (
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Website:</p>
                                        <a
                                            href={selectedUser.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {selectedUser.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="dark:bg-gray-800 dark:border-gray-700">
                            <Button color="gray" onClick={() => setSelectedUser(null)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
