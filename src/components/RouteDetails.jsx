function RouteDetails({ route, onClose, navMatch }) {
  return (
    <div className="border-t border-slate-800/50 bg-slate-900/60">
      <div className="p-4">
        {/* Navigation Summary (if in search mode) */}
        {navMatch && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Navigation Fare</span>
              <span className="text-sm font-black text-white">Rs {navMatch.fare}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Total fare from <span className="text-slate-200 font-bold">{navMatch.fromStop.name}</span> to <span className="text-slate-200 font-bold">{navMatch.toStop.name}</span>.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: route.color,
                boxShadow: `0 0 10px ${route.color}50`
              }}
            />
            <h3 className="font-bold text-white truncate max-w-[150px]">{route.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stops timeline */}
        <div className="space-y-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Stops</p>
          <div className="max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {route.stops.map((stop, index) => {
              const isFirst = index === 0
              const isLast = index === route.stops.length - 1
              
              const isNavFrom = navMatch && stop.id === navMatch.fromStop.id
              const isNavTo = navMatch && stop.id === navMatch.toStop.id
              const isInNavRange = navMatch && 
                index >= route.stops.findIndex(s => s.id === navMatch.fromStop.id) &&
                index <= route.stops.findIndex(s => s.id === navMatch.toStop.id)

              return (
                <div key={stop.id} className="flex items-center gap-2.5 group py-0.5">
                  <div className="flex flex-col items-center w-4">
                    <div
                      className={`w-[3px] ${isFirst ? 'h-0' : 'h-3'}`}
                      style={{ backgroundColor: isFirst ? 'transparent' : (isInNavRange ? route.color : route.color + '20') }}
                    />
                    <div
                      className={`rounded-full shrink-0 transition-all ${isNavFrom || isNavTo ? 'w-3 h-3 ring-4 ring-emerald-500/20' : (isFirst || isLast ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5')}`}
                      style={{ backgroundColor: (isNavFrom || isNavTo ? '#10b981' : route.color) }}
                    />
                    <div
                      className={`w-[3px] ${isLast ? 'h-0' : 'h-3'}`}
                      style={{ backgroundColor: isLast ? 'transparent' : (isInNavRange ? route.color : route.color + '20') }}
                    />
                  </div>

                  <span className={`text-xs ${isNavFrom || isNavTo ? 'text-emerald-400 font-bold' : (isInNavRange ? 'text-slate-200' : 'text-slate-600')}`}>
                    {stop.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteDetails
