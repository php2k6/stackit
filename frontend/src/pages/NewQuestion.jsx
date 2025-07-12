import React, { useState } from "react";
import { Card, Label, TextInput, Button } from "flowbite-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NewQuestion = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState(""); // Rich text content (HTML)
    const [tags, setTags] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const question = {
            title,
            desc,
            tags: "",
            image_path: ""
        };



        console.log("Posting question:", question);

        // TODO: Send to backend via fetch/axios
        const token = localStorage.getItem("token");
        console.log(token);

        axios.post("http://odoo.phpx.live/api/question/", question, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                console.log("Question posted successfully:", response.data);
                navigate("/questions"); // Redirect to questions page
            })
            .catch((error) => {
                console.error("Error posting question:", error);
            });
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Ask a New Question</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Title */}
                    <div>
                        <Label htmlFor="title" value="Question Title" />
                        <TextInput
                            id="title"
                            placeholder="e.g., How to use useEffect with async function?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="desc" value="Description" />
                        <RichTextEditor value={desc} setValue={setDesc} />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags" value="Tags (comma-separated)" />
                        <TextInput
                            id="tags"
                            placeholder="e.g., react, hooks, useEffect"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" gradientDuoTone="purpleToBlue">
                        Post Question
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default NewQuestion;
