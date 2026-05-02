import { createBrowserRouter, Navigate } from 'react-router';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tarefas from './pages/Tarefas';
import Recorrencias from './pages/Recorrencias';
import Historico from './pages/Historico';

// Helper component para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'tarefas',
        element: <Tarefas />,
      },
      {
        path: 'recorrencias',
        element: <Recorrencias />,
      },
      {
        path: 'historico',
        element: <Historico />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
