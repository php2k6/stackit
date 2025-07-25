import React, { useState } from "react";
import { Card, Label, TextInput, Button } from "flowbite-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config/config.js";

const NewQuestion = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !desc.trim()) {
            alert("Please fill in all required fields.");
            return;
        }

        const question = {
            title: title.trim(),
            desc: desc,
            tags: tags.trim(),
            image_path: ""
        };

        setSubmitting(true);

        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            if (!token) {
                alert("Please login to ask a question.");
                navigate("/login");
                return;
            }

            const response = await axios.post(`${config.API_BASE_URL}/question/`, question, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Question posted successfully:", response.data);
            alert("Question posted successfully!");
            navigate("/questions");
        } catch (error) {
            console.error("Error posting question:", error);
            if (error.response?.status === 401) {
                alert("Please login to ask a question.");
                navigate("/login");
            } else {
                alert("Failed to post question. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 min-h-screen bg-gray-50 dark:bg-gray-900 dark-bg-override">
            <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 bg-white border-gray-200 shadow-lg flowbite-card">
                <div className="bg-white dark:bg-gray-800">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Ask a New Question</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title" value="Question Title *" className="dark:text-gray-200" />
                            <TextInput
                                id="title"
                                placeholder="e.g., How to use useEffect with async function?"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="desc" value="Description *" className="dark:text-gray-200" />
                            <div className="mt-2">
                                <RichTextEditor value={desc} setValue={setDesc} />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <Label htmlFor="tags" value="Tags (comma-separated)" className="dark:text-gray-200" />
                            <TextInput
                                id="tags"
                                placeholder="e.g., react, hooks, useEffect"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enter tags separated by commas to help others find your question
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            gradientDuoTone="purpleToBlue"
                            disabled={submitting || !title.trim() || !desc.trim()}
                        >
                            {submitting ? "Posting..." : "Post Question"}
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default NewQuestion;
