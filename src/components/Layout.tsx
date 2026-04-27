import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Book,
  CheckSquare,
  MessageSquare,
  BarChart,
  LogOut,
  Crown,
  ShieldAlert,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { MentorChat } from '@/components/MentorChat'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isMentorOpen, setIsMentorOpen] = useState(false)

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const navItems = [
    { icon: Crown, label: 'Níveis', path: '/niveis' },
    { icon: Book, label: 'Painel', path: '/nivel/1' },
    { icon: CheckSquare, label: 'Agenda', path: '/agenda' },
    { icon: MessageSquare, label: 'Mentor', path: '/mentor' },
    { icon: BarChart, label: 'Relatórios', path: '/relatorios' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ]

  if (user?.role === 'admin') {
    navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin' })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
      <header className="md:hidden flex items-center justify-between p-4 bg-black/60 backdrop-blur-md border-b border-[#D4AF37]/20 sticky top-0 z-50">
        <div className="text-[#D4AF37] font-serif font-bold text-xl tracking-wider">
          MÉTODO LEÃO DOURADO
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#D4AF37]">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <aside className="hidden md:flex flex-col w-64 bg-black/60 backdrop-blur-xl border-r border-[#D4AF37]/20 fixed h-screen z-50">
        <div className="p-8 border-b border-[#D4AF37]/20 flex flex-col items-center justify-center gap-4">
          <Crown className="w-12 h-12 text-[#D4AF37]" />
          <div className="text-[#D4AF37] font-serif font-bold text-xl text-center leading-tight">
            MÉTODO
            <br />
            LEÃO DOURADO
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) && item.path !== '/niveis')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-2 border-[#D4AF37] text-[#D4AF37]'
                    : 'hover:bg-white/5 text-slate-400 hover:text-white',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[#D4AF37]/20">
          <div className="px-4 pb-4 mb-4 border-b border-white/5">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Logado como</p>
            <p className="text-sm font-medium text-slate-300 truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-[#D4AF37] mt-1 capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Sistema
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] relative md:ml-64 pb-20 md:pb-0">
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
          <Outlet />
        </div>

        {/* Floating Mentor Button for Mobile on specific routes */}
        {(location.pathname === '/niveis' || location.pathname.startsWith('/nivel/')) && (
          <div className="md:hidden fixed bottom-24 right-4 z-40">
            <Sheet open={isMentorOpen} onOpenChange={setIsMentorOpen}>
              <SheetTrigger asChild>
                <Button className="w-14 h-14 rounded-full bg-[#D4AF37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-[#AA8A2A] hover:scale-105 transition-all flex items-center justify-center p-0">
                  <MessageSquare className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[85vh] bg-black/95 border-t border-[#D4AF37]/30 p-0 flex flex-col rounded-t-3xl"
              >
                <SheetHeader className="p-4 border-b border-[#D4AF37]/20 text-left flex flex-row items-center justify-between">
                  <SheetTitle className="text-[#D4AF37] font-serif text-xl m-0">
                    Mentor IA
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden p-0 relative">
                  <MentorChat isWidget />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-[#D4AF37]/20 flex items-center justify-around p-2 z-50">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) && item.path !== '/niveis')

          if (item.path === '/mentor') {
            return (
              <button
                key={item.path}
                onClick={() => setIsMentorOpen(true)}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg transition-colors',
                  isMentorOpen ? 'text-[#D4AF37]' : 'text-slate-500',
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center p-2 rounded-lg transition-colors',
                isActive && !isMentorOpen ? 'text-[#D4AF37]' : 'text-slate-500',
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
