import { Link, useLocation } from 'react-router-dom'
import { Map, Plus, Shield } from 'lucide-react'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto left-0 right-0 z-[2000] bg-slate-900/85 backdrop-blur-xl border-t md:border-t-0 md:border-b border-white/10 px-2 sm:px-4 py-2 flex items-center justify-between shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] md:shadow-xl">
      <div className="hidden md:flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Map className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white tracking-wide">TempoMetro</span>
      </div>

      <div className="flex w-full md:w-auto items-center justify-around md:justify-end gap-1 sm:gap-2">
        <NavLink to="/" current={location.pathname === '/'} icon={Map}>
          Map
        </NavLink>
        <NavLink to="/contribute" current={location.pathname === '/contribute'} icon={Plus}>
          Contribute
        </NavLink>
        <NavLink to="/admin" current={location.pathname === '/admin'} icon={Shield}>
          Admin
        </NavLink>
      </div>
    </nav>
  )
}

function NavLink({ to, current, icon: Icon, children }) {
  return (
    <Link
      to={to}
      className={`flex flex-col md:flex-row items-center justify-center flex-1 md:flex-none px-2 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-200 ${
        current
          ? 'bg-white/10 text-white shadow-lg shadow-black/20'
          : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
      }`}
    >
      <Icon className="w-5 h-5 mb-1 md:mb-0 md:mr-1.5" />
      <span>{children}</span>
    </Link>
  )
}

export default Navigation
