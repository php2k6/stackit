
import React from 'react'
import PostCard from '../components/PostCard'
import { TextInput, Select } from 'flowbite-react';
import { useState, useMemo } from 'react';

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
    return (
        <>
            {/*  */}
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                {/* Search */}
                <TextInput
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-1/2"
                />

                {/* Tag Filter */}
                <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="w-full md:w-1/4">
                    <option value="All">All Tags</option>
                    {uniqueTags.map((tag, i) => (
                        <option key={i} value={tag}>{tag}</option>
                    ))}
                </Select>

                {/* Sort */}
                <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full md:w-1/4">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </Select>
            </div>
            <section>
                <h2 className='text-2xl font-bold my-2'>Latest Questions</h2>
                <div className="flex flex-col gap-4">
                    {questions.map((q) => (
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
            </section>

        </>
    )
}
