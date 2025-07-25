import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';
import config from '../config/config.js';

const Votes = ({ vote: initialVote, handleVote, itemId, isAnswer = false }) => {
    const [vote, setVote] = useState(initialVote || 0);
    const [userVote, setUserVote] = useState(null); // null, true (upvote), false (downvote)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVoteStats();
    }, [itemId]);

    const fetchVoteStats = async () => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (!token) return;

            const endpoint = isAnswer 
                ? `${config.API_BASE_URL}/vote/answer/${itemId}/stats`
                : `${config.API_BASE_URL}/vote/question/${itemId}/stats`;

            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setVote(response.data.total_votes);
            setUserVote(response.data.user_vote);
        } catch (error) {
            console.error("Error fetching vote stats:", error);
        }
    };

    const handleVoteClick = async (isUpvote) => {
        if (loading) return;
        if (!localStorage.getItem(config.TOKEN_KEY)) {
            alert("Please login to vote");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const endpoint = isAnswer 
                ? `${config.API_BASE_URL}/vote/answer/${itemId}`
                : `${config.API_BASE_URL}/vote/question/${itemId}`;

            const response = await axios.post(endpoint, 
                { is_upvote: isUpvote },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setVote(response.data.total_votes);
            setUserVote(isUpvote);
            
            // Call parent handler if provided
            if (handleVote) {
                handleVote(isUpvote ? "up" : "down");
            }
        } catch (error) {
            console.error("Error voting:", error);
            if (error.response?.status === 400) {
                alert(error.response.data.detail || "Cannot vote on your own content");
            }
        } finally {
            setLoading(false);
        }
    };

    const removeVote = async () => {
        if (loading || userVote === null) return;

        setLoading(true);
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const endpoint = isAnswer 
                ? `${config.API_BASE_URL}/vote/answer/${itemId}`
                : `${config.API_BASE_URL}/vote/question/${itemId}`;

            await axios.delete(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            fetchVoteStats(); // Refresh stats
        } catch (error) {
            console.error("Error removing vote:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start pt-2 text-gray-600 dark:text-gray-400">
            <button 
                onClick={() => userVote === true ? removeVote() : handleVoteClick(true)}
                disabled={loading}
                className={`p-1 rounded ${
                    userVote === true 
                        ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50' 
                        : 'hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <FaArrowUp />
            </button>
            <p className="font-semibold text-lg my-1 text-gray-900 dark:text-white">{vote}</p>
            <button 
                onClick={() => userVote === false ? removeVote() : handleVoteClick(false)}
                disabled={loading}
                className={`p-1 rounded ${
                    userVote === false 
                        ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50' 
                        : 'hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <FaArrowDown />
            </button>
        </div>
    );
};

export default Votes;