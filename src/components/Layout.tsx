import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Book, CheckSquare, MessageSquare, BarChart, LogOut, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import useAppStore from '@/stores/main'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const isLogin = location.pathname === '/'

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  const navItems = [
    { icon: Crown, label: 'Níveis', path: '/niveis' },
    { icon: Book, label: 'Diários', path: '/nivel/1' },
    { icon: CheckSquare, label: 'Agenda', path: '/agenda' },
    { icon: MessageSquare, label: 'Mentor', path: '/mentor' },
    { icon: BarChart, label: 'Relatórios', path: '/relatorios' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
      {!isLogin && (
        <>
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
                  {user?.name || 'Aluno'}
                </p>
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
        </>
      )}

      <main
        className={cn(
          'flex-1 flex flex-col min-h-[calc(100vh-64px)] relative',
          !isLogin && 'md:ml-64 pb-20 md:pb-0',
        )}
      >
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in-up">
          <Outlet />
        </div>
      </main>

      {!isLogin && (
        <nav className="md:hidden fixed bottom-0 w-full bg-black/90 backdrop-blur-xl border-t border-[#D4AF37]/20 flex items-center justify-around p-2 z-50">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) && item.path !== '/niveis')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg transition-colors',
                  isActive ? 'text-[#D4AF37]' : 'text-slate-500',
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
