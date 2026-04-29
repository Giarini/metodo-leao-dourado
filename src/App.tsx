import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import Layout from './components/Layout'
import Index from './pages/Index'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import WelcomePending from './pages/WelcomePending'
import Levels from './pages/Levels'
import Dashboard from './pages/Dashboard'
import DiarioDourado from './pages/DiarioDourado'
import DiarioCobre from './pages/DiarioCobre'
import Agenda from './pages/Agenda'
import Mentor from './pages/Mentor'
import Reports from './pages/Reports'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({
  children,
  requireActive = true,
}: {
  children: React.ReactNode
  requireActive?: boolean
}) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" />
  if (requireActive && user.status !== 'active' && user.role !== 'admin')
    return <Navigate to="/welcome-pending" />
  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/welcome-pending"
            element={
              <ProtectedRoute requireActive={false}>
                <WelcomePending />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute requireActive={true}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/niveis" element={<Levels />} />
            <Route path="/nivel/:id" element={<Dashboard />} />
            <Route path="/diario-dourado" element={<DiarioDourado />} />
            <Route path="/diario-cobre" element={<DiarioCobre />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
