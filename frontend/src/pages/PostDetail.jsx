// pages/PostDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Badge, Card, Spinner } from "flowbite-react";
import RichTextEditor from "../components/RichTextEditor";
import AnswerCard from "../components/AnswerCard";
import axios from "axios";
import { Button } from "flowbite-react";
import Votes from "../components/Votes";

const PostDetail = () => {
  const { qid } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editorValue, setEditorValue] = useState("");
  
  const handleSubmit = async () => {
    try {
      // Replace with your API endpoint
      const token = localStorage.getItem("token");
      await axios.post(
        "http://odoo.phpx.live/api/answer",
        {
          qid: post.id,
          content: editorValue.toString(),
          image_path: ""
        },
        {
          headers: {
        Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Answer submitted!");
      setEditorValue("");
    } catch (err) {
      alert("Failed to submit answer.");
    }
  };
  const [answers, setAnswers] = useState([]);
  // fetch the /api/question/{qid} it will return a list of votes,tags,answers,
  const [vote, setVote] = useState(0);
  const { id } = useParams();
  // Fetch post details when component mounts or id changes
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://odoo.phpx.live/api/question/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(response.data);
        setAnswers(response.data.answers);
        console.log(answers);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);
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
  const handleVote = (type) => {
    setVote((prev) => prev + (type === "up" ? 1 : -1));
  };
  // Ensure tags is an array by splitting if it's a string
  const tagsArray = Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(",") : []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumb aria-label="breadcrumb">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/">Questions</BreadcrumbItem>
        <BreadcrumbItem>{post.title}</BreadcrumbItem>
      </Breadcrumb>

      <Card>
        <div className="flex mt-6 p-6">
          <Votes vote={post.votes || 0} handleVote={handleVote} />

          <div className="flex-1 p-3">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {tagsArray.map((tag, i) => (
                <Badge key={i} color="info" className="text-sm">{tag.trim()}</Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Posted by <span className="font-medium">{post.username || "Anonymous"}</span>
            </p>
            <div
              className=" revert-tailwind text-gray-700 leading-relaxed text-base"
              // style="all: 'revert';"
              dangerouslySetInnerHTML={{ __html: post.desc }}
            />
          </div>
        </div>
      </Card>

      <section className="mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Answers</h2>
        {
          answers.map((answer, index) => (
            <AnswerCard
              key={index}
              content={answer.content}
              votes={answer.votes}
              answerId={answer.aid}
            />
          ))}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Post Your Answer</h2>
        <RichTextEditor value={editorValue} setValue={setEditorValue} />
        <Button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleSubmit}
          type="button"
        >
          Submit Answer
        </Button>
      </section>
    </div>
  );
};

export default PostDetail;
