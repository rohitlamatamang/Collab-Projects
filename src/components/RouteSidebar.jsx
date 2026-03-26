import { Bus, Car, Eye, EyeOff, MapPin } from 'lucide-react'
import { Badge } from './ui/badge'

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
                    <Badge variant="success" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                      Rs {navMatch.fare}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md">
                    {route.vehicleType === 'Bus' ? (
                      <Bus className="w-3 h-3" />
                    ) : (
                      <Car className="w-3 h-3" />
                    )}
                    {route.vehicleType}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3" />
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
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
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
