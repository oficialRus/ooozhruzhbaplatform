import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { MODULES } from '@/config/modules';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Главная',
  ...Object.fromEntries(MODULES.map((m) => [m.path, m.title])),
};

export default function AppLayout() {
  const location = useLocation();
  const title = ROUTE_TITLES[location.pathname] || 'Главная';

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
