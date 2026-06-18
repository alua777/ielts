import './App.css'
import { Routes, Route } from 'react-router-dom'
import Ielts from './pages/Start'
import Writing from './pages/Writing'
import About from './pages/About'
import LoginPage from './pages/LoginPage'
import Reading from './pages/Reading'
import Dashboard from './pages/Dashboard'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Header from './components/header/Header'
import { ExamProvider } from './context/ExamContext'
import Listening from './pages/Listening'
import Results from './pages/Results'
import Speaking from './pages/Speaking'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ReviewAnswers from './pages/ReviewAnswers'
import Practice from './pages/Practice'
import PracticeSection from './pages/PracticeSection'
import PracticeTest from './pages/PracticeTest'
import PracticeFeedback from './pages/PracticeFeedback'
import ErrorBoundary from './components/ui/ErrorBoundary'
import History from './pages/History'
import OnboardingSurvey from './pages/OnboardingSurvey'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

function App() {
  return (
    <>
    <AuthProvider> 
       <ExamProvider>
    <ErrorBoundary>
    <Header />
      <Routes>
        <Route path="/" element={<Ielts />} />
        <Route path="/ielts" element={<Ielts />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/ielts/about" element={<About />} />
        <Route path="/ielts/writing" element={<Writing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/listening" element={
          <ProtectedRoute><Listening /></ProtectedRoute>
        } />
        <Route path="/reading" element={
          <ProtectedRoute>
            <Reading />
          </ProtectedRoute>
          } />
        <Route path="/writing" element={<ProtectedRoute><Writing /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/results/:attemptParam" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/review-answers" element={<ProtectedRoute><ReviewAnswers /></ProtectedRoute>} />
        <Route path="/speaking" element={<ProtectedRoute><Speaking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/practice/test/:id" element={<ProtectedRoute><PracticeTest /></ProtectedRoute>} />
        <Route path="/practice/feedback/:id" element={<ProtectedRoute><PracticeFeedback /></ProtectedRoute>} />
        <Route path="/practice/:section" element={<ProtectedRoute><PracticeSection /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingSurvey /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
       </ExamProvider>      
      </AuthProvider> 
    </>
  )
}

export default App


