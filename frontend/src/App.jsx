import { useState } from 'react'
import './App.css'
import Nav from "./components/Nav"
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Signup from './pages/signup'
import PostDetail from './pages/PostDetail'
import { Routes, Route } from 'react-router-dom';
import { Footer } from 'flowbite-react'
import Login from './pages/Login'
import NewQuestion from './pages/NewQuestion'
import Questions from './pages/Questions'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/questions" element={<Questions />} />
        {/* Add a route for the login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/ask" element={<NewQuestion />} />

        {/* dynamic routing when clicked on individual posts */}
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
      <section >
        <Footer className="bg-gray-800 text-white py-4 rounded-none mt-0">
          <div className="container mx-auto text-center">
            <p>&copy; 2025 Company. All rights reserved.</p>
          </div>
        </Footer>
      </section>
    </>
  )
}

export default App
