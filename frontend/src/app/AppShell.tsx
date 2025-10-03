import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/useAuth';
import { toast } from 'sonner';
// import { logoutApi } from '@/api/auth'; // if your backend has a logout endpoint

export default function AppShell() {
  const { token, user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    try {
      // await logoutApi(); // if server needs to clear cookie/session
    } finally {
      logout();
      toast('Signed out');
      nav('/login');
    }
  };

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded ${isActive ? 'underline font-semibold' : 'hover:bg-gray-100'}`;

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <h1 className="text-lg font-bold">VitaTrack</h1>
          <nav className="flex gap-2">
            <NavLink to="/food" className={link}>Food</NavLink>
            <NavLink to="/workout" className={link}>Workout</NavLink>
            <NavLink to="/goals" className={link}>Goals</NavLink>
          </nav>
          {token || user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" onClick={doLogout}>Logout</Button>
            </div>
          ) : (
            <Button variant="outline" asChild><NavLink to="/login">Login</NavLink></Button>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}



// import { NavLink, Outlet } from 'react-router-dom';

// export default function AppShell() {
//   const cls = ({ isActive }: { isActive: boolean }) =>
//     `px-3 py-2 rounded ${isActive ? 'underline font-semibold' : 'hover:bg-gray-100'}`;
//   return (
//     <div className="min-h-screen grid grid-rows-[auto,1fr]">
//       <header className="border-b">
//         <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
//           <h1 className="text-lg font-bold">VitaTrack</h1>
//           <nav className="flex gap-2">
//             <NavLink to="/food" className={cls}>Food</NavLink>
//             <NavLink to="/workout" className={cls}>Workout</NavLink>
//             <NavLink to="/goals" className={cls}>Goals</NavLink>
//           </nav>
//         </div>
//       </header>
//       <main className="max-w-5xl mx-auto w-full px-4 py-6">
//         <Outlet />
//       </main>
//     </div>
//   );
// }
