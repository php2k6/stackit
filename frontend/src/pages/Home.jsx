
import React from 'react'
import PostCard from '../components/PostCard'
import { TextInput, Select,Button } from 'flowbite-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// Dummy data
const questions = [
    {
        id: 1,
        title: "How to use useEffect with async function in React?",
        tags: ["react", "hooks", "javascript"],
        desc: "Trying to fetch data in useEffect. Any issues with async?",
        totalAns: 5,
        date: "2024-07-11",
    },
    {
        id: 2,
        title: "What is the difference between var, let and const?",
        tags: ["javascript", "variables"],
        desc: "Confused between var, let, and const in ES6. Which one to use?",
        totalAns: 2,
        date: "2024-07-12",
    },
    {
        id: 3,
        title: "Best way to style React components",
        tags: ["react", "css", "tailwind"],
        desc: "Should I use Tailwind, CSS modules or styled-components?",
        totalAns: 4,
        date: "2024-07-10",
    },
];


const uniqueTags = [...new Set(questions.flatMap(q => q.tags))];

export default function Home() {
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [sort, setSort] = useState("newest");
    const filteredPosts = useMemo(() => {
        return [...questions]
            .filter((q) => {
                const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.desc.toLowerCase().includes(search.toLowerCase());
                const matchTag = selectedTag === "All" || q.tags.includes(selectedTag);
                return matchSearch && matchTag;
            })
            .sort((a, b) => {
                if (sort === "newest") return new Date(b.date) - new Date(a.date);
                return new Date(a.date) - new Date(b.date);
            });
    }, [search, selectedTag, sort]);

    // const [cards, setcards] = useState()
    var names = ["hello", "hi", "nice", "hello", "hi", "nice"]
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 2;

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * postsPerPage;
        return filteredPosts.slice(start, start + postsPerPage);
    }, [filteredPosts, currentPage, postsPerPage]);

    return (
        <main className='w-full min-h-screen bg-gray-100 p-6'>
            {/* Filter Bar */}
            <div className="flex md:flex-row justify-between items-center mb-6 gap-4 items-center">
                <h1 className="text-3xl font-semibold mb-2">Welcome Back User</h1>
                <Button as={Link} to="/ask" color="blue" className="w-full md:w-auto">Ask a Question</Button>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                <TextInput
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full md:w-1/2"
                />
                <Select value={selectedTag} onChange={(e) => {
                    setSelectedTag(e.target.value);
                    setCurrentPage(1);
                }} className="w-full md:w-1/4">
                    <option value="All">All Tags</option>
                    {uniqueTags.map((tag, i) => (
                        <option key={i} value={tag}>{tag}</option>
                    ))}
                </Select>
                <Select value={sort} onChange={(e) => {
                    setSort(e.target.value);
                    setCurrentPage(1);
                }} className="w-full md:w-1/4">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </Select>
            </div>
            <section>
                <h2 className='text-2xl font-bold my-2'>Latest Questions</h2>
                <div className="flex flex-col gap-4">
                    {paginatedPosts.map((q) => (
                        <PostCard
                            key={q.id}
                            id={q.id}
                            title={q.title}
                            tags={q.tags}
                            desc={q.desc}
                            totalAns={q.totalAns}
                        />
                    ))}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        Prev
                    </Button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </section>
        </main>
    )
}
