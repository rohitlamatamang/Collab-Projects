import { Card } from './ui/card'

function Legend({ routes, visibleRouteIds }) {
  const visibleRoutes = routes.filter(r => visibleRouteIds.has(r.id))

  if (visibleRoutes.length === 0) return null

  return (
    <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-[1000]">
      <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-700/50 px-4 py-3 shadow-xl shadow-black/30">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Legend
        </p>
        <div className="space-y-1.5">
          {visibleRoutes.map(route => (
            <div key={route.id} className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-[3px] rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                <div
                  className="w-2 h-2 rounded-full border-[1.5px]"
                  style={{ borderColor: route.color, backgroundColor: 'transparent' }}
                />
              </div>
              <span className="text-[11px] text-slate-400">{route.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Legend
