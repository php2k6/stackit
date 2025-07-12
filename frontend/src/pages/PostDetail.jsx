import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Badge, Card, Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import AnswerCard from "../components/AnswerCard";
import { useLocation } from "react-router-dom";
import LexicalEditor from "../components/LexicalEditor";

const PostDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleEditorChange = (root, selection) => {
    console.log("Editor content changed:", root.__cachedText);
  };

  // 👇 Don't use JSX in useEffect
  useEffect(() => {
    if (!state) return; // exit early if state is missing

    const { title, tags, desc, totalAns } = state;

    setTimeout(() => {
      setPost({ id, title, tags, desc, totalAns });
      setLoading(false);
    }, 1000);
  }, [id, state]);

  // 👇 Early return if no post data
  if (!state) {
    return (
      <p className="text-center mt-10 text-gray-600">
        No post data provided.
      </p>
    );
  }

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
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Answers</h2>
        {/* populate the AnswerCard component */}
        <AnswerCard
          title="Re: How to use useEffect with async function in React?"
          content="<p>You can use an IIFE (Immediately Invoked Function Expression) inside useEffect to handle async calls.</p>"
          votes={5}
          comments={["Great answer!", "Thanks for the tip!"]}
        />
      </section>
      <section>
        <h2>Post Answers</h2>
        <LexicalEditor  />


      </section>
    </div>

  );
};

export default PostDetail;
