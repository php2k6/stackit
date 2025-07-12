import React from "react";
import { Badge, Card } from "flowbite-react";
import { Link } from "react-router-dom";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useState } from "react";


const PostCard = ({ id, title, tags, desc, totalAns, username }) => {
    const [vote, setVote] = useState(10 || 0);

    const handleVote = (type) => {
        setVote((prev) => prev + (type === "up" ? 1 : -1));
    };
    return (
        <Card className="w-full p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-row justify-between items-start gap-6">
                <div className="flex flex-col items-center justify-start pt-2 text-gray-600">
                    <button onClick={() => handleVote("up")}>
                        <FaArrowUp className="hover:text-green-600" />
                    </button>
                    <p className="font-semibold text-lg">{vote}</p>
                    <button onClick={() => handleVote("down")}>
                        <FaArrowDown className="hover:text-red-600" />
                    </button>
                </div>
                <div className="flex-1">
                    <Link to={`/post/${id}`} state={{ id, title, tags, desc, totalAns }} className="block">
                        <h2 className="text-xl font-semibold text-blue-700 hover:underline cursor-pointer">
                            {title}
                        </h2>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Posted by <span className="font-medium">{username || "Anonymous"}</span></p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(typeof tags === "string" ? tags.split(",") : tags).map((tag, i) => (
                            <Badge key={i} color="info" className="text-sm">
                                {tag.trim()}
                            </Badge>
                        ))}
                    </div>
                    <p className="mt-3 text-gray-700 text-sm">{desc}</p>
                </div>
                {/* Right: Total Answers */}    
                <div className="w-[80px] shrink-0 text-center bg-gray-100 p-2 rounded-md border">
                    <p className="text-lg font-bold text-green-600">{totalAns}</p>
                    <p className="text-xs text-gray-600">Answers</p>
                </div>
            </div>
        </Card>
    );
};

export default PostCard;
