import { NavLink, Outlet } from 'react-router-dom';

export default function AppShell() {
  const cls = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? 'underline font-semibold' : 'hover:bg-gray-100'}`;
  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-lg font-bold">VitaTrack</h1>
          <nav className="flex gap-2">
            <NavLink to="/food" className={cls}>Food</NavLink>
            <NavLink to="/workout" className={cls}>Workout</NavLink>
            <NavLink to="/goals" className={cls}>Goals</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
