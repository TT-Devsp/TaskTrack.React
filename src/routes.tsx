import { createBrowserRouter, Navigate } from 'react-router';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tarefas from './pages/Tarefas';
import Recorrencias from './pages/Recorrencias';
import Historico from './pages/Historico';
import AdminUsuarios from './pages/AdminUsuarios';
import Aprovacoes from './pages/Aprovacoes';
import Planejamentos from './pages/Planejamentos';
import Execucoes from './pages/Execucoes';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Aguarda verificação do localStorage
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
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
        element: (
          <ProtectedRoute>
            <Tarefas />
          </ProtectedRoute>
        ),
      },
      {
        path: 'recorrencias',
        element: (
          <ProtectedRoute>
            <Recorrencias />
          </ProtectedRoute>
        ),
      },
      {
        path: 'historico',
        element: (
          <ProtectedRoute>
            <Historico />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/usuarios',
        element: (
          <ProtectedRoute>
            <AdminUsuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: 'aprovacoes',
        element: (
          <ProtectedRoute>
            <Aprovacoes />
          </ProtectedRoute>
        ),
      },
      {
        path: 'planejamentos',
        element: (
          <ProtectedRoute>
            <Planejamentos />
          </ProtectedRoute>
        ),
      },
      {
        path: 'execucoes',
        element: (
          <ProtectedRoute>
            <Execucoes />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
