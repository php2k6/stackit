import React, { useEffect } from 'react'
import PostCard from '../components/PostCard'
import { TextInput, Select, Button } from 'flowbite-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';






const Questions = () => {

    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");
    const [sort, setSort] = useState("newest");
    const [questions, setQuestions] = useState([]);

    // fetch questions from api /api/question/
    useEffect(() => {
        fetchQuestions();
    }, []);
    useEffect(() => {
        if (search) {
            searchQuestions(search);
        } else {
            fetchQuestions();   
    }
    }, [search]);


    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get("http://odoo.phpx.live/api/question/", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    
    const [isSearched, setIsSearched] = useState(false);
    // search the questions based on title by just fetching from server passing in api/questions
    const searchQuestions = async (searchTerm) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://odoo.phpx.live/api/question/?search=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setQuestions(response.data);
            setIsSearched(true);
            console.log("Searched questions:", response.data);
            
            // fetchQuestions();
        } catch (error) {
            console.error("Error searching questions:", error);
        }
    };
    // same for filter
    const filterQuestions = (tag) => {
        if (tag === "All") {
            fetchQuestions();
        } else {
            const filtered = questions.filter(q => q.tags.includes(tag));
            setQuestions(filtered);
        }
    };

    // const [cards, setcards] = useState()
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 2;

    const totalPages = Math.ceil(questions.length / postsPerPage);
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * postsPerPage;
        return questions.slice(start, start + postsPerPage);
    }, [questions, currentPage, postsPerPage]);

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
                <Button onClick={() => searchQuestions(search)} className="w-full md:w-auto">
                    Search
                </Button>
                {/*  */}
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
                            key={q.qid}
                            id={q.qid}
                            title={q.title}
                            tags={q.tags}
                            desc={q.desc}
                            username={q.username}
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

export default Questions