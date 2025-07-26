import { useState } from 'react'
import './App.css'
import './styles/dark-mode-overrides.css'
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
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import Notifications from './pages/Notifications'
import { Toaster } from 'react-hot-toast'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* dynamic routing when clicked on individual posts */}
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
      <section >
        <Footer className="bg-gray-800 dark:bg-gray-900 text-white py-4 rounded-none mt-0">
          <div className="container mx-auto text-center">
            <p className="text-gray-200 dark:text-gray-300">&copy; 2025 StackIt. All rights reserved.</p>
          </div>
        </Footer>
      </section>
    </>
  )
}

export default App
