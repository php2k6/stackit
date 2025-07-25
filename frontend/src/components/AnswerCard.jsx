import React, { useState, useEffect } from "react";
import { Button, Textarea } from "flowbite-react";
import Votes from "./Votes";
import axios from "axios";
import config from "../config/config.js";

const AnswerCard = ({ answerId, content, votes, username, accepted, qid, onAcceptToggle }) => {
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isQuestionAuthor, setIsQuestionAuthor] = useState(false);

    useEffect(() => {
        fetchComments();
        checkIfQuestionAuthor();
    }, [answerId]);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (!token) return;

            const response = await axios.get(`${config.API_BASE_URL}/comments/${answerId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const checkIfQuestionAuthor = async () => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const user = JSON.parse(localStorage.getItem(config.USER_KEY) || "{}");
            
            if (!token || !user.id) return;

            const response = await axios.get(`${config.API_BASE_URL}/question/${qid}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setIsQuestionAuthor(response.data.userid === user.id);
        } catch (error) {
            console.error("Error checking question author:", error);
        }
    };

    const postComment = async () => {
        if (!commentText.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            await axios.post(
                `${config.API_BASE_URL}/comments/${answerId}`,
                { message: commentText.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            setCommentText("");
            setShowCommentBox(false);
            fetchComments(); // Refresh comments
        } catch (error) {
            console.error("Error posting comment:", error);
            alert("Failed to post comment");
        } finally {
            setLoading(false);
        }
    };

    const toggleAcceptAnswer = async () => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const endpoint = accepted 
                ? `${config.API_BASE_URL}/answer/${answerId}/unaccept`
                : `${config.API_BASE_URL}/answer/${answerId}/accept`;

            await axios.post(endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (onAcceptToggle) {
                onAcceptToggle(answerId, !accepted);
            }
        } catch (error) {
            console.error("Error toggling accept answer:", error);
            alert("Failed to update answer status");
        }
    };

    return (
        <div className={`flex gap-4 bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-lg shadow-sm mb-4 ${accepted ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' : ''}`}>
            <Votes vote={votes || 0} itemId={answerId} isAnswer={true} />
            
            <div className="flex-1">
                {accepted && (
                    <div className="mb-2">
                        <span className="inline-block px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            ✓ Accepted Answer
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Answered by <span className="font-medium text-gray-700 dark:text-gray-300">{username}</span>
                    </p>
                    
                    {isQuestionAuthor && (
                        <Button
                            size="xs"
                            color={accepted ? "failure" : "success"}
                            onClick={toggleAcceptAnswer}
                        >
                            {accepted ? "Unaccept" : "Accept Answer"}
                        </Button>
                    )}
                </div>

                <div
                    className="prose prose-sm prose-slate dark:prose-invert max-w-full mt-2 text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Comments */}
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Comments:</h4>
                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No comments yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.cid} className="text-sm text-gray-600 dark:text-gray-400 pl-2 mb-2 border-l-2 border-gray-200 dark:border-gray-600">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{comment.username}:</span> {comment.message}
                            </div>
                        ))
                    )}
                </div>

                {/* Add comment */}
                <div className="mt-3">
                    {showCommentBox ? (
                        <div className="flex flex-col gap-2">
                            <Textarea
                                rows={2}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                disabled={loading}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            />
                            <div className="flex gap-2">
                                <Button 
                                    size="xs" 
                                    onClick={postComment}
                                    disabled={loading || !commentText.trim()}
                                >
                                    {loading ? "Posting..." : "Post"}
                                </Button>
                                <Button 
                                    size="xs" 
                                    color="gray" 
                                    onClick={() => {
                                        setShowCommentBox(false);
                                        setCommentText("");
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            size="xs" 
                            onClick={() => setShowCommentBox(true)}
                        >
                            Add Comment
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
