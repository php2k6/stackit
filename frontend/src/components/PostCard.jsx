import React from "react";
import { Card, Badge } from "flowbite-react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import Votes from "./Votes";

const PostCard = ({ qid, title, tags, desc, totalAns, username, votes, created_at }) => {
    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(",") : []);
    
    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Card className="mb-4 hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex gap-4">
                {/* Left: Voting */}
                <Votes vote={votes || 0} itemId={qid} isAnswer={false} />
                
                {/* Middle: Content */}
                <div className="flex-1">
                    <Link to={`/post/${qid}`} state={{ qid, title, tags, desc, totalAns, username, votes, created_at }} className="block">
                        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                            {title}
                        </h2>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{username || "Anonymous"}</span>
                        {created_at && <span> on {formatDate(created_at)}</span>}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tagsArray.map((tag, i) => (
                            <Badge key={i} color="info" className="text-sm dark:bg-blue-900 dark:text-blue-200">
                                {tag.trim()}
                            </Badge>
                        ))}
                    </div>
                    <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm line-clamp-3">{desc}</p>
                </div>
                
                {/* Right: Total Answers */}
                <div className="w-[80px] shrink-0 text-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md border dark:border-gray-600">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalAns || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Answers</p>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;
