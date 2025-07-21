import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Tabs, Badge, Spinner, TextInput, Textarea, Modal, Label } from 'flowbite-react';
import { PencilIcon, UserIcon, QuestionMarkCircleIcon, ChatBubbleLeftIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import profileService from '../services/profileService';
import { toast } from 'react-hot-toast';
import config from '../config/config.js';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [userQuestions, setUserQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        bio: '',
        location: '',
        website: ''
    });
    const navigate = useNavigate();

    const getUsernameFromStorage = () => {
        // Try to get username from user object first, then from dedicated username key
        const user = JSON.parse(localStorage.getItem(config.USER_KEY) || '{}');
        return user.username || localStorage.getItem(config.USERNAME_KEY);
    };

    const username = getUsernameFromStorage();

    useEffect(() => {
        if (username) {
            fetchProfileData();
        }
    }, [username]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            
            // Get current user profile
            const profile = await profileService.getMyProfile();
            setProfileData(profile);
            
            // Fetch questions and answers from API endpoints
            await fetchUserQuestionsAndAnswers(profile);
            
            // Try to get additional data, but don't fail if endpoints don't exist
            try {
                const stats = await profileService.getUserStats(username);
                setUserStats(stats);
            } catch (error) {
                console.warn('Stats endpoint not available:', error.message);
                // Set default stats
                setUserStats({
                    total_questions: userQuestions.length,
                    total_answers: userAnswers.length,
                    total_comments: (profile.comments || []).length,
                    total_upvotes: (profile.upvotes || []).length,
                    reputation: (profile.upvotes || []).length * 10
                });
            }
            
            // Set form data for editing
            setEditForm({
                fullName: profile.full_name || '',
                bio: profile.bio || '',
                location: profile.location || '',
                website: profile.website || ''
            });
        } catch (error) {
            toast.error('Failed to load profile data');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserQuestionsAndAnswers = async (profile) => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            
            console.log('Profile: Raw profile data:', profile);
            
            // Parse questions data - comes as [[qid, title], ...]
            if (profile.questions && profile.questions.length > 0) {
                const questionPromises = profile.questions.map(async (questionArray) => {
                    try {
                        const [qid, title] = questionArray;
                        console.log('Profile: Processing question qid:', qid, 'title:', title);
                        
                        if (!qid) {
                            console.warn('Profile: No question ID found for question array:', questionArray);
                            return {
                                qid: null,
                                title: title || 'Unknown Question',
                                votes: 0,
                                answers: [],
                                created_at: null,
                                tags: ''
                            };
                        }
                        
                        const response = await fetch(`${config.API_BASE_URL}/question/${qid}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (response.ok) {
                            const questionData = await response.json();
                            return {
                                qid: qid,
                                title: questionData.title || title,
                                votes: questionData.votes || 0,
                                answers: questionData.answers || [],
                                created_at: questionData.created_at,
                                tags: questionData.tags || ''
                            };
                        } else {
                            return {
                                qid: qid,
                                title: title,
                                votes: 0,
                                answers: [],
                                created_at: null,
                                tags: ''
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching question ${questionArray[0]}:`, error);
                        return {
                            qid: questionArray[0],
                            title: questionArray[1] || 'Unknown Question',
                            votes: 0,
                            answers: [],
                            created_at: null,
                            tags: ''
                        };
                    }
                });
                
                const detailedQuestions = await Promise.all(questionPromises);
                setUserQuestions(detailedQuestions.filter(q => q.qid)); // Filter out null qids
            } else {
                setUserQuestions([]);
            }
            
            // Parse answers data - comes as [[aid, question_title], ...]
            if (profile.answers && profile.answers.length > 0) {
                console.log('Profile: Raw answers data:', profile.answers);
                const detailedAnswers = profile.answers.map((answerArray) => {
                    try {
                        const [aid, questionTitle] = answerArray;
                        console.log('Profile: Processing answer aid:', aid, 'question title:', questionTitle);
                        
                        return {
                            aid: aid,
                            question_title: questionTitle || 'Unknown Question',
                            votes: 0, // We'd need to fetch from answer endpoint to get votes
                            content: 'Click to view full answer...',
                            created_at: null,
                            is_accepted: false
                        };
                    } catch (error) {
                        console.error(`Error processing answer:`, answerArray, error);
                        return {
                            aid: answerArray[0] || 'unknown',
                            question_title: answerArray[1] || 'Unknown Question',
                            votes: 0,
                            content: 'Click to view full answer...',
                            created_at: null,
                            is_accepted: false
                        };
                    }
                });
                
                setUserAnswers(detailedAnswers);
            } else {
                setUserAnswers([]);
            }
            
        } catch (error) {
            console.error('Error fetching user questions and answers:', error);
            // Fallback to empty arrays
            setUserQuestions([]);
            setUserAnswers([]);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const updatedProfile = await profileService.updateProfile(editForm);
            setProfileData(updatedProfile);
            setEditModalOpen(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error updating profile:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="xl" />
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-sm">
                    <p className="text-gray-500">Profile not found</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Profile Header */}
                <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <Avatar
                            img={profileData.profile_path || `https://ui-avatars.com/api/?name=${profileData.username || "User"}`}
                            alt={profileData.full_name || profileData.username}
                            size="xl"
                            rounded
                        />
                        
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {profileData.full_name || profileData.username}
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300">@{profileData.username}</p>
                                    {profileData.bio && (
                                        <p className="text-gray-700 dark:text-gray-300 mt-2">{profileData.bio}</p>
                                    )}
                                    {profileData.location && (
                                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">📍 {profileData.location}</p>
                                    )}
                                    {profileData.website && (
                                        <a
                                            href={profileData.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                        >
                                            🌐 {profileData.website}
                                        </a>
                                    )}
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                                        Member since {formatDate(profileData.joined_since)}
                                    </p>
                                </div>
                                
                                <Button
                                    color="blue"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats Cards */}
                {userStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-center">
                                <QuestionMarkCircleIcon className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total_questions}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Questions</p>
                            </div>
                        </Card>
                        
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-center">
                                <ChatBubbleLeftIcon className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total_answers}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Answers</p>
                            </div>
                        </Card>
                        
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-center">
                                <ArrowUpIcon className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.total_upvotes}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Upvotes</p>
                            </div>
                        </Card>
                        
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <div className="text-center">
                                <UserIcon className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.reputation}</p>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Reputation</p>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Questions and Answers Tabs */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <Tabs>
                        <Tabs.Item active title={`Questions (${userQuestions.length})`}>
                            <div className="space-y-4">
                                {userQuestions.length > 0 ? (
                                    userQuestions.map((question) => (
                                        <div key={question.qid || question.id} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Link 
                                                        to={`/post/${question.qid}`}
                                                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer block"
                                                    >
                                                        {question.title || 'Untitled Question'}
                                                    </Link>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {question.tags && question.tags.split(',').map((tag, index) => (
                                                            <Badge key={index} color="gray" size="sm" className="dark:bg-gray-700 dark:text-gray-300">
                                                                {tag.trim()}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                                                        Asked on {question.created_at ? formatDate(question.created_at) : 'Unknown date'}
                                                    </p>
                                                </div>
                                                <div className="text-center ml-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {question.votes || 0} votes
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {(question.answers ? question.answers.length : 0)} answers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No questions yet</p>
                                )}
                            </div>
                        </Tabs.Item>
                        
                        <Tabs.Item title={`Answers (${userAnswers.length})`}>
                            <div className="space-y-4">
                                {userAnswers.length > 0 ? (
                                    userAnswers.map((answer) => (
                                        <div key={answer.aid || answer.id} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        Answer to: <span className="font-medium text-blue-600 dark:text-blue-400">
                                                            {answer.question_title || answer.title || 'Question'}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="prose max-w-none dark:prose-invert text-sm"
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: (answer.content || answer.desc || 'No content available').substring(0, 200) + '...' 
                                                        }}
                                                    />
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                                                        Answered on {answer.created_at ? formatDate(answer.created_at) : 'Unknown date'}
                                                    </p>
                                                    {answer.is_accepted && (
                                                        <Badge color="success" size="sm" className="mt-2">
                                                            Accepted Answer
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-center ml-4">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {answer.votes || 0} votes
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No answers yet</p>
                                )}
                            </div>
                        </Tabs.Item>
                    </Tabs>
                </Card>

                {/* Edit Profile Modal */}
                <Modal show={editModalOpen} onClose={() => setEditModalOpen(false)}>
                    <Modal.Header>Edit Profile</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullName" value="Full Name" />
                                <TextInput
                                    id="fullName"
                                    type="text"
                                    value={editForm.fullName}
                                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="bio" value="Bio" />
                                <Textarea
                                    id="bio"
                                    rows={3}
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    placeholder="Tell us about yourself"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="location" value="Location" />
                                <TextInput
                                    id="location"
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="Where are you located?"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="website" value="Website" />
                                <TextInput
                                    id="website"
                                    type="url"
                                    value={editForm.website}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleUpdateProfile}>Save Changes</Button>
                        <Button color="gray" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default Profile;
