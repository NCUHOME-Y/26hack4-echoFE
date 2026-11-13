import { Outlet } from 'react-router-dom'
import TabBar from '../../components/TabBar'
import './index.css'

export default function BasicLayout() {
  return (
    <div className="basic-layout">
      <main className="basic-layout__content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
