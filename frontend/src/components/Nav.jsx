import React from "react";
import logo from "../assets/logo11.png";
import { Button, Navbar, NavbarBrand, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link } from "react-router-dom";

export default function Nav() {
    return (
        <Navbar fluid className="bg-white border-b border-gray-200">
            <NavbarBrand as={Link} to="/">
                <img src={logo} className="mr-3 h-10 sm:h-9" alt="StackIt" />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">StackIt</span>
            </NavbarBrand>
            <div className="flex items-center gap-4 md:order-2">
                {/* Notification Icon with Count */}
                <div className="relative">
                    <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">3</span>
                    </button>
                </div>
                {/* User Profile Photo */}
                <button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none">
                    <img
                        className="w-8 h-8 rounded-full object-cover"
                        src="https://ui-avatars.com/api/?name=User"
                        alt="User Profile"
                    />
                </button>
                {/* conditional rendering for login/logout */}
                {localStorage.getItem("isLoggedIn") ? (
                    <Button onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        window.location.reload();
                    }} as={Link} to="/" color="light">Signout</Button>
                ) : (
                    <Button as={Link} to="/signup" color="light">Sign Up</Button>
                )}
                <NavbarToggle />
            </div>
            <NavbarCollapse>
                <Link to="/" className="text-blue-700">Home</Link>
                <Link to="/ask" className="text-gray-700 hover:text-blue-700">Ask</Link>
                <Link to="/questions" className="text-gray-700 hover:text-blue-700">Search</Link>
                {/* <Link to="/pricing" className="text-gray-700 hover:text-blue-700">Pricing</Link> */}
                <Link to="/contact" className="text-gray-700 hover:text-blue-700">Contact</Link>
            </NavbarCollapse>
        </Navbar>
    );
}