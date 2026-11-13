import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Login/Register'
import Home from './pages/home'
import BasicLayout from './layouts/BasicLayout'
import RequireAuth from './components/RequireAuth'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/ask" element={<div style={{ padding: 24 }}>提问</div>} />

      <Route element={<RequireAuth><BasicLayout /></RequireAuth>}>
            <Route path="/home" element={<Home />} />
            <Route path="/debate" element={<div style={{ padding: 24 }}>争议</div>} />
            <Route path="/shell" element={<div style={{ padding: 24 }}>海螺</div>} />
            <Route path="/profile" element={<div style={{ padding: 24 }}>我的</div>} />
            </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App



