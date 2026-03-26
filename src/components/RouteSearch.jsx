import { useState, useMemo } from 'react'

export default function RouteSearch({ allRoutes, onSearch, onClear }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Get unique stop names for suggestions
  const allStops = useMemo(() => {
    const stopsSet = new Set()
    allRoutes.forEach(r => {
      r.stops.forEach(s => stopsSet.add(s.name))
    })
    return Array.from(stopsSet).sort()
  }, [allRoutes])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!from || !to) return
    setIsSearching(true)
    onSearch(from, to)
  }

  const handleClear = () => {
    setFrom('')
    setTo('')
    setIsSearching(false)
    onClear()
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 mb-2 shadow-inner shadow-white/5">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Find Navigation</h3>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
          </div>
          <input
            type="text"
            placeholder="From where?"
            list="stop-suggestions"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
          </div>
          <input
            type="text"
            placeholder="To where?"
            list="stop-suggestions"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/5 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <datalist id="stop-suggestions">
          {allStops.map(name => <option key={name} value={name} />)}
        </datalist>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold uppercase tracking-wider py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
          >
            Find Route
          </button>
          {(from || to || isSearching) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3.5 bg-slate-800 border border-white/5 hover:bg-slate-700 text-slate-400 rounded-2xl transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
