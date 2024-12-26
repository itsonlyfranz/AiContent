import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/lib/AuthContext';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <AuthLayout />
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;