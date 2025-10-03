import { createBrowserRouter } from 'react-router-dom';
import AppShell from './AppShell';
import Protected from './Protected';  // Import it
import Food from '@/pages/Food';
import Workout from '@/pages/Workout';
import Goals from '@/pages/Goals';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <Protected />,  // Add Protected wrapper
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Food /> },
          { path: 'food', element: <Food /> },
          { path: 'workout', element: <Workout /> },
          { path: 'goals', element: <Goals /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);