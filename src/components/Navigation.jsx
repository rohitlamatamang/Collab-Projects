import { Link, useLocation } from 'react-router-dom'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto left-0 right-0 z-[2000] bg-slate-900/85 backdrop-blur-xl border-t md:border-t-0 md:border-b border-white/10 px-2 sm:px-4 py-2 flex items-center justify-between shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] md:shadow-xl">
      <div className="hidden md:flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <span className="font-bold text-white tracking-wide">TempoMetro</span>
      </div>

      <div className="flex w-full md:w-auto items-center justify-around md:justify-end gap-1 sm:gap-2">
        <NavLink to="/" current={location.pathname === '/'}>
          <svg className="w-5 h-5 mb-1 md:mb-0 md:mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
          <span>Map</span>
        </NavLink>
        <NavLink to="/contribute" current={location.pathname === '/contribute'}>
          <svg className="w-5 h-5 mb-1 md:mb-0 md:mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          <span>Contribute</span>
        </NavLink>
        <NavLink to="/admin" current={location.pathname === '/admin'}>
          <svg className="w-5 h-5 mb-1 md:mb-0 md:mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          <span>Admin</span>
        </NavLink>
      </div>
    </nav>
  )
}

function NavLink({ to, current, children }) {
  return (
    <Link
      to={to}
      className={`flex flex-col md:flex-row items-center justify-center flex-1 md:flex-none px-2 sm:px-4 py-2 rounded-2xl text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300 ${
        current
          ? 'bg-white/10 text-white shadow-lg shadow-black/20 scale-105'
          : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
      }`}
    >
      {children}
    </Link>
  )
}

export default Navigation
