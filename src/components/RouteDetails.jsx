import { X, Banknote } from 'lucide-react'
import { Button } from './ui/button'

function RouteDetails({ route, onClose, navMatch }) {
  return (
    <div className="border-t border-white/10 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-3xl shrink-0 transition-all duration-300">
      <div className="p-4 md:p-6 shadow-[0_-20px_30px_-15px_rgba(0,0,0,0.5)]">
        {/* Navigation Summary (if in search mode) */}
        {navMatch && (
          <div className="mb-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 shadow-inner shadow-emerald-500/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Banknote className="w-3 h-3" />
                Navigation Fare
              </span>
              <span className="text-xl font-black text-white drop-shadow-md">Rs {navMatch.fare}</span>
            </div>
            <p className="text-xs text-slate-300 leading-tight">
              Total fare from <span className="text-white font-bold">{navMatch.fromStop.name}</span> to <span className="text-white font-bold">{navMatch.toStop.name}</span>.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{
                backgroundColor: route.color,
                boxShadow: `0 0 16px ${route.color}80, inset 0 0 4px rgba(255,255,255,0.5)`
              }}
            />
            <h3 className="font-bold text-white text-base truncate max-w-[200px] md:max-w-[250px] leading-tight">{route.name}</h3>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stops timeline */}
        <div className="space-y-0">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Route Stops</p>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent" />
          </div>
          <div className="max-h-40 overflow-y-auto no-scrollbar md:custom-scrollbar pr-1 relative">
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
