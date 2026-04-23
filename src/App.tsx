import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppProvider } from '@/stores/main'
import Layout from './components/Layout'
import Index from './pages/Index'
import Levels from './pages/Levels'
import Dashboard from './pages/Dashboard'
import DiarioDourado from './pages/DiarioDourado'
import DiarioCobre from './pages/DiarioCobre'
import Agenda from './pages/Agenda'
import Mentor from './pages/Mentor'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/niveis" element={<Levels />} />
            <Route path="/nivel/:id" element={<Dashboard />} />
            <Route path="/diario-dourado" element={<DiarioDourado />} />
            <Route path="/diario-cobre" element={<DiarioCobre />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/relatorios" element={<Reports />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
