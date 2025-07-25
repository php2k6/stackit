import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import config from '../config/config.js';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
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
        const { username, password } = formData;

        if (!username || !password) {
            setMsg("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${config.API_BASE_URL}/auth/login`, {
                username,
                password,
            });

            // Store JWT and user data
            console.log(response.data);
            
            localStorage.setItem(config.TOKEN_KEY, response.data.access_token);
            localStorage.setItem(config.USER_KEY, JSON.stringify(response.data.user));
            console.log("Login success ✅");
            setMsg("Login Success! ");
            
            // fetch the user data from api
            const userResponse = await axios.get(`${config.API_BASE_URL}/user/me`, {
                headers: {
                    Authorization: `Bearer ${response.data.access_token}`,
                },
            });
            
            localStorage.setItem(config.USER_KEY, JSON.stringify(userResponse.data));
            localStorage.setItem(config.IS_LOGGED_IN_KEY, "true");
            // Also store username separately for easier access
            localStorage.setItem(config.USERNAME_KEY, userResponse.data.username);

            console.log("User data fetched successfully ✅");
            
            // Dispatch custom event to update navbar
            window.dispatchEvent(new Event('loginStateChanged'));
            
            // Small delay to ensure state updates
            setTimeout(() => {
                navigate("/");
            }, 100);

        } catch (error) {
            setMsg("Login failed! Invalid Username or password");
            console.error("Login error ❌", error);
        } finally {
            setLoading(false);
        }
    };

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
                            Sign in to your account
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your username</label>
                                <input 
                                    onChange={handleChange} 
                                    type="text" 
                                    name="username" 
                                    id="username" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    placeholder="Your username" 
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
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don't have an account yet? <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500"> Sign up</Link>
                            </p>
                            {Msg && (
                                <p className={`text-sm ${Msg.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {Msg}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login