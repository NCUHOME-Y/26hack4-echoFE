// src/layouts/BasicLayout/index.tsx
import { Outlet } from 'react-router-dom';

export default function BasicLayout() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 这里是中间的内容区，路由切换时，这里的内容会变 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet /> {/* 核心：子路由渲染的地方 */}
      </div>

      {/* 底部导航栏（暂时用文字模拟） */}
      <div style={{ height: '60px', background: '#f5f5f5', borderTop: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        [ 底部导航栏 ]
      </div>
    </div>
  );
}