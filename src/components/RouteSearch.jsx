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
    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Find Navigation</h3>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          </div>
          <input
            type="text"
            placeholder="From where?"
            list="stop-suggestions"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
          </div>
          <input
            type="text"
            placeholder="To where?"
            list="stop-suggestions"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        <datalist id="stop-suggestions">
          {allStops.map(name => <option key={name} value={name} />)}
        </datalist>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/10"
          >
            Find Route
          </button>
          {(from || to || isSearching) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
