import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Login/Register'

type Page = 'login' | 'register'

function App() {
  // 登录页 / 注册页是两个独立页面，这里只负责在它们之间切换。
  // 以后接了路由库，把这两行换成路由配置即可，页面组件不用改。
  const [page, setPage] = useState<Page>('login')

  return page === 'login' ? (
    <Login onSwitchToRegister={() => setPage('register')} />
  ) : (
    <Register onSwitchToLogin={() => setPage('login')} />
  )
}

export default App
