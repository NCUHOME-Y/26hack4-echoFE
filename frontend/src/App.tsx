import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Login/Register'
import Home from './pages/home'
import BasicLayout from './layouts/BasicLayout'
import RequireAuth from './components/RequireAuth'
import Profile from './pages/profile'
import Debate from './pages/debate'
import DebateDetailPage from './pages/debate/detail'
import Question from './pages/question'
import Ask from './pages/ask'
import Shell from './pages/shell'
import End from './pages/end'
import AnswerEnd from './pages/end/answerend'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/ask" element={<Ask />} />
      <Route path="/question" element={<Question />} />
      <Route path="/settle/:id" element={<End />} />
      <Route path="/answer-end/:id" element={<AnswerEnd />} />

      <Route element={<RequireAuth><BasicLayout /></RequireAuth>}>
            <Route path="/home" element={<Home />} />
            <Route path="/debate" element={<Debate />} />
            <Route path="/debate/:id" element={<DebateDetailPage />} />
            <Route path="/shell" element={<Shell />} />
            <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App



