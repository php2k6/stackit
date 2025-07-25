import React from 'react'
import { Link, Navigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config/config.js';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [Msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password, confirmPassword, username } = formData;

        if (!username || !email || !password || !confirmPassword) {
            setMsg("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setMsg("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_BASE_URL}/auth/signup`, {
                username,
                password,
                email,
                type: false,
                googlelogin: false,
                profile_path: ""
            });

            setMsg("Signup successful! " + response.data.message);
            console.log("Signup success ✅");
            
            // Dispatch custom event
            window.dispatchEvent(new Event('loginStateChanged'));
            
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setMsg("Signup failed! " + (error.response?.data?.detail || "Please try again"));
            console.error("Signup error ❌", error);
        } finally {
            setLoading(false);
        }
    }

    // Redirect if already logged in
    if (localStorage.getItem(config.TOKEN_KEY) && localStorage.getItem(config.IS_LOGGED_IN_KEY) === "true") {
        return <Navigate to="/" replace />;
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                    StackIT
                </a>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Create an account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                    Username
                                </label>
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name="username"
                                    id="username"
                                    placeholder="Your username"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                                <input 
                                    onChange={handleChange} 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    placeholder="name@company.com" 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input 
                                    onChange={handleChange} 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm password</label>
                                <input 
                                    onChange={handleChange} 
                                    type="password" 
                                    name="confirmPassword" 
                                    id="confirmPassword" 
                                    placeholder="••••••••" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Creating account...' : 'Create an account'}
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Already have an account?
                                <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500"> Login here</Link>
                            </p>
                        </form>
                        {Msg && (
                            <p className={`text-sm mt-2 ${Msg.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                                {Msg}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Signup