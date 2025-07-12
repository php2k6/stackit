import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb,BreadcrumbItem , Badge, Card, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";

const PostDetail = () => {
  const { id } = useParams(); // 👈 get dynamic id from URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetch (replace with real API call)
  useEffect(() => {
    setTimeout(() => {
      // Example mock post
      const mockPost = {
        id,
        title: "How to use useEffect with async function in React?",
        tags: ["react", "hooks", "javascript"],
        desc: "I'm trying to fetch data inside useEffect but getting unexpected behavior. How should I handle async calls properly?",
      };

      setPost(mockPost);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner aria-label="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      
      
      <Breadcrumb aria-label="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/questions">Questions</BreadcrumbItem>
        <BreadcrumbItem>{post.title}</BreadcrumbItem>
      </Breadcrumb>

      {/* Question Card */}
      <Card className="mt-6 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <Badge key={i} color="info" className="text-sm">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-gray-700 leading-relaxed text-base">{post.desc}</p>
      </Card>
    </div>
  );
};

export default PostDetail;
