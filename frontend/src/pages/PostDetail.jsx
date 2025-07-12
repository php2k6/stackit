// pages/PostDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Badge, Card, Spinner } from "flowbite-react";
import RichTextEditor from "../components/RichTextEditor";
import AnswerCard from "../components/AnswerCard";

const PostDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editorValue, setEditorValue] = useState("");

  useEffect(() => {
    if (!state) return;
    const { title, tags, desc, totalAns } = state;
    setTimeout(() => {
      setPost({ id, title, tags, desc, totalAns });
      setLoading(false);
    }, 500);
  }, [id, state]);

  if (!state) return <p className="text-center mt-10 text-gray-600">No post data provided.</p>;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner aria-label="Loading..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb aria-label="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/questions">Questions</BreadcrumbItem>
        <BreadcrumbItem>{post.title}</BreadcrumbItem>
      </Breadcrumb>

      <Card className="mt-6 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, i) => (
            <Badge key={i} color="info" className="text-sm">{tag}</Badge>
          ))}
        </div>
        <p className="text-gray-700 leading-relaxed text-base">{post.desc}</p>
      </Card>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Answers</h2>
        <AnswerCard
          title="Sample Answer"
          content="<p>This is a rich text answer</p>"
          votes={2}
          comments={["Thanks!", "Helpful"]}
        />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Post Your Answer</h2>
        <RichTextEditor value={editorValue} setValue={setEditorValue} />
      </section>
    </div>
  );
};

export default PostDetail;
