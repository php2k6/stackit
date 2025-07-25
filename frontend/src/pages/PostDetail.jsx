// pages/PostDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Badge, Card, Spinner, Button } from "flowbite-react";
import RichTextEditor from "../components/RichTextEditor";
import AnswerCard from "../components/AnswerCard";
import Votes from "../components/Votes";
import axios from "axios";
import config from "../config/config.js";

const PostDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorValue, setEditorValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem(config.TOKEN_KEY);
      const response = await axios.get(`${config.API_BASE_URL}/question/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setPost(response.data);
      setAnswers(response.data.answers || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching post:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!editorValue.trim()) {
      alert("Please write an answer before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem(config.TOKEN_KEY);
      await axios.post(
        `${config.API_BASE_URL}/answer/`,
        {
          qid: id,
          content: editorValue,
          image_path: ""
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      alert("Answer submitted successfully!");
      setEditorValue("");
      fetchPost(); // Refresh to get new answer
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptToggle = (answerId, newAcceptedStatus) => {
    setAnswers(answers.map(answer => 
      answer.aid === answerId 
        ? { ...answer, accepted: newAcceptedStatus }
        : { ...answer, accepted: false } // Unaccept other answers
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner aria-label="Loading..." />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center mt-10 text-gray-600 dark:text-gray-400 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        Post not found or failed to load.
      </div>
    );
  }

  const tagsArray = Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(",") : []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 min-h-screen bg-gray-50 dark:bg-gray-900 dark-bg-override">
      <Breadcrumb aria-label="breadcrumb" className="mb-4">
        <BreadcrumbItem href="/" className="text-gray-600 dark:text-gray-400">Home</BreadcrumbItem>
        <BreadcrumbItem href="/questions" className="text-gray-600 dark:text-gray-400">Questions</BreadcrumbItem>
        <BreadcrumbItem className="text-gray-900 dark:text-white">{post.title}</BreadcrumbItem>
      </Breadcrumb>

      <Card className="dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200 shadow-lg flowbite-card">
        <div className="flex mt-6 p-6 bg-white dark:bg-gray-800">
          <Votes vote={post.votes || 0} itemId={post.qid} isAnswer={false} />

          <div className="flex-1 p-3 bg-white dark:bg-gray-800">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{post.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {tagsArray.map((tag, i) => (
                <Badge key={i} color="info" className="text-sm dark:bg-blue-900 dark:text-blue-200">{tag.trim()}</Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{post.username || "Anonymous"}</span>
              {post.created_at && (
                <span> on {new Date(post.created_at).toLocaleDateString()}</span>
              )}
            </p>
            <div
              className="revert-tailwind text-gray-700 dark:text-gray-300 leading-relaxed text-base prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.desc }}
            />
          </div>
        </div>
      </Card>

      <section className="mt-6 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        {answers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No answers yet. Be the first to answer!
          </div>
        ) : (
          answers
            .sort((a, b) => {
              // Sort by accepted first, then by votes, then by date
              if (a.accepted && !b.accepted) return -1;
              if (!a.accepted && b.accepted) return 1;
              if (a.votes !== b.votes) return b.votes - a.votes;
              return new Date(b.created_at) - new Date(a.created_at);
            })
            .map((answer) => (
              <AnswerCard
                key={answer.aid}
                answerId={answer.aid}
                content={answer.content}
                votes={answer.votes}
                username={answer.username}
                accepted={answer.accepted}
                qid={post.qid}
                onAcceptToggle={handleAcceptToggle}
              />
            ))
        )}
      </section>

      {localStorage.getItem(config.TOKEN_KEY) && (
        <section className="mt-8 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Post Your Answer</h2>
          <RichTextEditor value={editorValue} setValue={setEditorValue} />
          <Button
            className="mt-4"
            onClick={handleSubmit}
            disabled={submitting || !editorValue.trim()}
          >
            {submitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </section>
      )}
    </div>
  );
};

export default PostDetail;
