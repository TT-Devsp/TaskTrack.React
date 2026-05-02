import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { MaintenanceProvider } from './contexts/MaintenanceContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <MaintenanceProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </MaintenanceProvider>
    </AuthProvider>
  );
}