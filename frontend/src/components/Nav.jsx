import React from "react";
import logo from "../assets/logo11.png";
import { Button, Navbar, NavbarBrand, NavbarCollapse, NavbarToggle } from "flowbite-react";
import { Link } from "react-router-dom";

export default function Nav() {
    return (
        <Navbar fluid  className="bg-white border-b border-gray-200">
            <NavbarBrand as={Link} to="/">
                <img src={logo} className="mr-3 h-10 sm:h-9" alt="Flowbite React Logo" />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900">Flowbite React</span>
            </NavbarBrand>
            <div className="flex md:order-2">
                <Button as={Link} to="/signup" color="light">Sign Up</Button>
                {/* <NavbarToggle /> */}
            </div>
            <div className="flex gap-5" id="navbar-default">
                <Link to="/" className="text-blue-700">Home</Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-700">About</Link>
                <Link to="/services" className="text-gray-700 hover:text-blue-700">Services</Link>
                <Link to="/pricing" className="text-gray-700 hover:text-blue-700">Pricing</Link>
                <Link to="/contact" className="text-gray-700 hover:text-blue-700">Contact</Link>
            </div>
        </Navbar>
    );
}
