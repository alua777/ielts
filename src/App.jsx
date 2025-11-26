import './App.css'
import { Link,  Routes, Route} from 'react-router-dom'
import Ielts from './pages/exam/Start'
import Writing from './pages/exam/writing/Writing'
import About from './pages/About'
import LoginPage from './pages/Login'
import Reading from './pages/exam/reading/Reading'
function App() {

  return (
    <div className='h-full'>
    
       <nav>
        <Link to="/ielts">Ielts</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
        <Link to="/reading">Reading</Link>
        <Link to="/writing">Writing</Link>
      </nav>
      <Routes>
        <Route path="/ielts/about" element={<About />} />
        <Route path="/ielts" element={<Ielts />} />
        <Route path="/ielts/writing" element={<Writing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/writing" element={<Writing />} />

      </Routes>
    </div>
  )
}

export default App
