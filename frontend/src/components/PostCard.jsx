import React from "react";
import { Badge, Card } from "flowbite-react";
import { Link } from "react-router-dom";

const PostCard = ({ id, title, tags, desc, totalAns }) => {
    return (
        <Link to={`/post/${id}`} className="block">
            <Card className="w-full p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex flex-row justify-between items-start gap-6">
                    {/* Left: Question Details */}
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-blue-700 hover:underline cursor-pointer">
                            {title}
                        </h2>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                                <Badge key={i} color="info" className="text-sm">
                                    {tag}
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
        </Link>
    );
};

export default PostCard;
