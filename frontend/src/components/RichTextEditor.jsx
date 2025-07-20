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
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg overflow-hidden">
      <ReactQuill
        value={value}
        onChange={setValue}
        modules={modules}
        theme="snow"
        placeholder="Write your answer here..."
        className="dark:text-white"
        style={{
          backgroundColor: 'transparent'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
