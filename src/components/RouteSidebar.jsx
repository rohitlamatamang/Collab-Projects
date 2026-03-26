function RouteSidebar({ routes, selectedRouteId, visibleRouteIds, onSelectRoute, onToggleRoute, searchResult }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 mb-3">
        {searchResult ? 'Matching Routes' : 'Available Routes'}
      </p>
      {routes.map(route => {
        const isSelected = selectedRouteId === route.id
        const isVisible = visibleRouteIds.has(route.id)
        
        // Find if this route has a search match
        const navMatch = searchResult?.matches.find(m => m.routeId === route.id)

        return (
          <div
            key={route.id}
            className={`
              group relative rounded-xl p-3.5 cursor-pointer
              transition-all duration-200 ease-out
              border border-transparent
              ${isSelected
                ? 'bg-slate-800/80 border-slate-700/50 shadow-lg shadow-black/10'
                : 'hover:bg-slate-800/40 hover:border-slate-700/30'
              }
            `}
            onClick={() => onSelectRoute(route.id)}
          >
            <div className="flex items-start gap-3">
              {/* Route color indicator */}
              <div className="mt-0.5 relative">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${isSelected ? 'scale-125' : ''}`}
                  style={{
                    backgroundColor: isVisible ? route.color : '#475569',
                    boxShadow: isVisible && isSelected ? `0 0 12px ${route.color}60` : 'none'
                  }}
                />
              </div>

              {/* Route info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-semibold leading-tight transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {route.name}
                  </h3>
                  {navMatch && (
                    <span className="shrink-0 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Rs {navMatch.fare}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {route.vehicleType === 'Bus' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M8 17v2a1 1 0 01-1 1H6a1 1 0 01-1-1v-2m14 0v2a1 1 0 01-1 1h-1a1 1 0 01-1-1v-2M5 17V7a2 2 0 012-2h10a2 2 0 012 2v10M5 13h14" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h6l2-2zm-6 0h4m-2-8v4" />
                      )}
                    </svg>
                    {route.vehicleType}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {route.stops.length} stops
                  </span>
                </div>
              </div>

              {/* Toggle visibility */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRoute(route.id)
                }}
                className={`
                  mt-0.5 p-1.5 rounded-lg transition-all duration-200
                  ${isVisible
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-700/50'
                  }
                `}
                title={isVisible ? 'Hide route' : 'Show route'}
              >
                {isVisible ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RouteSidebar
