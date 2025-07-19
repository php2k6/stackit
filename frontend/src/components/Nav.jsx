import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo11.png";
import { Button, Navbar, NavbarBrand, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import config from "../config/config.js";

export default function Nav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState({});
    const location = useLocation();

    // Update login state when component mounts or localStorage changes
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem(config.TOKEN_KEY);
            const isLoggedInValue = localStorage.getItem(config.IS_LOGGED_IN_KEY) === "true";
            const userData = JSON.parse(localStorage.getItem(config.USER_KEY) || "{}");
            
            setIsLoggedIn(token && isLoggedInValue);
            setUser(userData);
        };

        // Check on mount
        checkLoginStatus();

        // Listen for storage changes (when user logs in/out in another tab)
        window.addEventListener('storage', checkLoginStatus);
        
        // Custom event listener for login state changes
        window.addEventListener('loginStateChanged', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            window.removeEventListener('loginStateChanged', checkLoginStatus);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(config.IS_LOGGED_IN_KEY);
        localStorage.removeItem(config.USER_KEY);
        localStorage.removeItem(config.TOKEN_KEY);
        localStorage.removeItem(config.USERNAME_KEY);
        
        setIsLoggedIn(false);
        setUser({});
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('loginStateChanged'));
        
        // Redirect to home page
        window.location.href = "/";
    };

    // Function to get active link class
    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return isActive 
            ? "text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/50 px-3 py-2 rounded-md" 
            : "text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors";
    };

    return (
        <Navbar fluid className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <NavbarBrand as={Link} to="/">
                <img src={logo} className="mr-3 h-10 sm:h-9" alt="StackIt" />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">StackIt</span>
            </NavbarBrand>
            <div className="flex items-center gap-4 md:order-2">
                {/* Notification Component - only show if logged in */}
                {isLoggedIn && <NotificationDropdown />}

                {/* User Profile Photo - only show if logged in */}
                {isLoggedIn && (
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                        <img
                            className="w-8 h-8 rounded-full object-cover"
                            src={user.profile_path || `https://ui-avatars.com/api/?name=${user.username || "User"}`}
                            alt="User Profile"
                        />
                    </button>
                )}

                {/* conditional rendering for login/logout */}
                {isLoggedIn ? (
                    <Button onClick={handleLogout} color="light" size="sm" className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Sign Out
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button as={Link} to="/login" color="light" size="sm" className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            Sign In
                        </Button>
                        <Button as={Link} to="/signup" color="blue" size="sm">
                            Sign Up
                        </Button>
                    </div>
                )}
                <NavbarToggle />
            </div>
            <NavbarCollapse>
                <Link to="/" className={getLinkClass("/")}>
                    Home
                </Link>
                <Link to="/ask" className={getLinkClass("/ask")}>
                    Ask
                </Link>
                <Link to="/questions" className={getLinkClass("/questions")}>
                    Search
                </Link>
                {isLoggedIn && (
                    <Link to="/profile" className={getLinkClass("/profile")}>
                        Profile
                    </Link>
                )}
                {isLoggedIn && (
                    <Link to="/notifications" className={getLinkClass("/notifications")}>
                        Notifications
                    </Link>
                )}
                {isLoggedIn && (user.type === true || user.type === 1) && (
                    <Link to="/admin" className={getLinkClass("/admin")}>
                        Admin Panel
                    </Link>
                )}
                <Link to="/contact" className={getLinkClass("/contact")}>
                    Contact
                </Link>
            </NavbarCollapse>
        </Navbar>
    );
}