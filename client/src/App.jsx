import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Footer from './components/Footer'
import ExperiencePage from './components/ExperiencePage'

function HomePage() {
  return (
    <div>
      <Navbar />
      <main>
        <Intro />
        <About />
        <Experience />
        <Projects />
        <Footer />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/experience/:id" element={<ExperiencePage />} />
    </Routes>
  )
}
