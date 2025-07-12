import React, { use, useState } from "react";
import { Button, Textarea } from "flowbite-react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import Votes from "./Votes";
import axios from "axios";
import { useEffect } from "react";
const AnswerCard = ({ content, votes,username }) => {
    const [vote, setVote] = useState(votes || 0);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]); // Initialize with an empty array

    const handleVote = (type) => {
        setVote((prev) => prev + (type === "up" ? 1 : -1));
    };
    // fetch comments from the server from comments/{answerId} endpoint
    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://odoo.phpx.live/api/comments/${answerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setComments(response.data);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };
        fetchComments();
    }, [answerId]);

    return (
        <div className="flex gap-4 bg-white border p-4 rounded-lg shadow-sm">

            <Votes vote={vote} handleVote={handleVote} />
            
            <div className="flex-1">
                {/* <h3 className="text-lg font-semibold text-gray-800">{title}</h3> */}
                <div
                    className="prose prose-sm prose-slate max-w-full mt-2"
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Comments */}
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Comments:</h4>
                    {comments.map((c, i) => (
                        <p key={i} className="text-sm text-gray-500 pl-2 mb-1">
                            - {c.username}: {c.message}
                        </p>
                    ))}
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
                            />
                            <div className="flex gap-2">
                                <Button size="xs" onClick={() => {
                                    if (commentText.trim()) {
                                        comments.push(commentText.trim());
                                        setCommentText("");
                                        setShowCommentBox(false);
                                    }
                                }}>
                                    Post
                                </Button>
                                <Button size="xs" color="gray" onClick={() => setShowCommentBox(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button size="xs" onClick={() => setShowCommentBox(true)}>
                            Add Comment
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnswerCard;
