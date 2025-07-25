import React, { useState, useEffect, useMemo } from 'react';
import PostCard from '../components/PostCard';
import { TextInput, Select, Button } from 'flowbite-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config.js';

export default function Home() {
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [sort, setSort] = useState("trending");
    const [questions, setQuestions] = useState([]);
    const [questionsWithAnswerCount, setQuestionsWithAnswerCount] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 5;

    useEffect(() => {
        fetchQuestions();
    }, [sort, currentPage]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.API_BASE_URL}/home/?sort=${sort}&page=${currentPage}&per_page=${postsPerPage}`);
            const questionsData = response.data;
            setQuestions(questionsData);
            
            // Fetch answer counts for each question
            await fetchAnswerCounts(questionsData);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswerCounts = async (questionsData) => {
        try {
            const token = localStorage.getItem(config.TOKEN_KEY);
            
            // Create promises for fetching each question's details
            const answerCountPromises = questionsData.map(async (question) => {
                try {
                    const questionId = question.qid || question.id;
                    
                    if (!questionId) {
                        console.warn('Home: No question ID found for question:', question);
                        return {
                            ...question,
                            answer_count: 0
                        };
                    }
                    
                    const response = await axios.get(`${config.API_BASE_URL}/question/${questionId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    
                    return {
                        ...question,
                        answer_count: response.data.answers ? response.data.answers.length : 0
                    };
                } catch (error) {
                    console.error(`Error fetching answers for question ${question.qid || question.id}:`, error);
                    return {
                        ...question,
                        answer_count: 0
                    };
                }
            });

            // Wait for all promises to resolve
            const questionsWithCounts = await Promise.all(answerCountPromises);
            setQuestionsWithAnswerCount(questionsWithCounts);
        } catch (error) {
            console.error("Error fetching answer counts:", error);
            // Fallback: set answer_count to 0 for all questions
            setQuestionsWithAnswerCount(questionsData.map(q => ({ ...q, answer_count: 0 })));
        }
    };

    const uniqueTags = useMemo(() => {
        const allTags = questionsWithAnswerCount.flatMap(q => 
            q.tags ? (typeof q.tags === 'string' ? q.tags.split(',') : q.tags) : []
        );
        return [...new Set(allTags.map(tag => tag.trim()))].filter(Boolean);
    }, [questionsWithAnswerCount]);

    const filteredPosts = useMemo(() => {
        return questionsWithAnswerCount.filter((q) => {
            const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                               q.desc.toLowerCase().includes(search.toLowerCase());
            const matchTag = selectedTag === "All" || 
                           (q.tags && q.tags.toLowerCase().includes(selectedTag.toLowerCase()));
            return matchSearch && matchTag;
        });
    }, [questionsWithAnswerCount, search, selectedTag]);

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * postsPerPage;
        return filteredPosts.slice(start, start + postsPerPage);
    }, [filteredPosts, currentPage, postsPerPage]);

    return (
        <main className='w-full min-h-screen bg-gray-100 dark:bg-gray-900 p-6'>
            {/* Header */}
            <div className="flex md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                    Welcome Back {JSON.parse(localStorage.getItem("user") || "{}")?.username || "User"}
                </h1>
                <Button as={Link} to="/ask" color="blue" className="w-full md:w-auto">
                    Ask a Question
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center w-full mb-6">
                <TextInput
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full md:w-1/2"
                />
                <Select 
                    value={selectedTag} 
                    onChange={(e) => {
                        setSelectedTag(e.target.value);
                        setCurrentPage(1);
                    }} 
                    className="w-full md:w-1/4"
                >
                    <option value="All">All Tags</option>
                    {uniqueTags.map((tag, i) => (
                        <option key={i} value={tag}>{tag}</option>
                    ))}
                </Select>
                <Select 
                    value={sort} 
                    onChange={(e) => {
                        setSort(e.target.value);
                        setCurrentPage(1);
                    }} 
                    className="w-full md:w-1/4"
                >
                    <option value="trending">Trending</option>
                    <option value="latest">Latest</option>
                    <option value="most_popular">Most Popular</option>
                </Select>
            </div>

            {/* Questions Section */}
            <section>
                <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>Latest Questions</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading questions and answer counts...</span>
                    </div>
                ) : paginatedPosts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {search || selectedTag !== "All" ? 'No questions found matching your criteria.' : 'No questions available.'}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {paginatedPosts.map((q) => (
                            <PostCard
                                key={q.qid}
                                qid={q.qid}
                                title={q.title}
                                tags={q.tags}
                                desc={q.desc}
                                totalAns={q.answer_count || 0}
                                username={q.username}
                                votes={q.votes}
                                created_at={q.created_at}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && paginatedPosts.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <Button
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            Prev
                        </Button>
                        <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
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
                )}
            </section>
        </main>
    );
}
