import type { ReactNode } from 'react'
import { Outlet,Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Login/Register'
import Home from './pages/home'
import BasicLayout from './layouts/BasicLayout'
import RequireAuth from './components/RequireAuth'
import { isLoggedIn } from './api/auth'
import Profile from './pages/profile'
import Debate from './pages/debate'
import DebateDetailPage from './pages/debate/detail'
import Question from './pages/question'
import Ask from './pages/ask'
import Shell from './pages/shell'
import End from './pages/end'
import AnswerEnd from './pages/end/answerend'

function GuestOnly({ children }: { children: ReactNode }){
  return isLoggedIn() ? <Navigate to="/home" replace /> : children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route element={<RequireAuth><Outlet /></RequireAuth>}>
        <Route path="/ask" element={<Ask />} />
        <Route path="/question" element={<Question />} />
        <Route path="/settle/:id" element={<End />} />
        <Route path="/answer-end/:id" element={<AnswerEnd />} />
      </Route>

      <Route element={<RequireAuth><BasicLayout /></RequireAuth>}>
            <Route path="/home" element={<Home />} />
            <Route path="/debate" element={<Debate />} />
            <Route path="/debate/:id" element={<DebateDetailPage />} />
            <Route path="/shell" element={<Shell />} />
            <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to={isLoggedIn()? '/home' : '/login'} replace />} />
    </Routes>
  )
}

export default App



