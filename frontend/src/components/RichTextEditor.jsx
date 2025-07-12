// components/RichTextEditor.jsx
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ value, setValue }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
    ],
  };

  return (
    <div className="bg-white border rounded p-2">
      <ReactQuill
        value={value}
        onChange={setValue}
        modules={modules}
        theme="snow"
        placeholder="Write your answer here..."
      
      />
    </div>
  );
};

export default RichTextEditor;
