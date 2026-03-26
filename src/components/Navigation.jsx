import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-[2000] bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-xl shadow-black/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <span className="font-bold text-white tracking-wide">TempoMetro</span>
      </div>

      <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 gap-1 overflow-x-auto custom-scrollbar max-w-full">
        <NavLink to="/" current={location.pathname === '/'}>Commuter Maps</NavLink>
        <NavLink to="/contribute" current={location.pathname === '/contribute'}>Contribute</NavLink>
        <NavLink to="/admin" current={location.pathname === '/admin'}>Admin</NavLink>
      </div>
    </nav>
  )
}

function NavLink({ to, current, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        current
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50 border border-transparent'
      }`}
    >
      {children}
    </Link>
  )
}

export default Navigation
