import { useState, useCallback, useEffect } from 'react'
import RouteSidebar from '../components/RouteSidebar'
import RouteMap from '../components/RouteMap'
import RouteDetails from '../components/RouteDetails'
import RouteSearch from '../components/RouteSearch'
import routesData from '../data/routes.json'
import { supabase } from '../lib/supabase'

function App() {
  const [allRoutes, setAllRoutes] = useState(routesData)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [visibleRouteIds, setVisibleRouteIds] = useState(
    () => new Set(routesData.map(r => r.id))
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Navigation Search State
  const [searchResult, setSearchResult] = useState(null) // { from, to, matches: [{ routeId, fare }] }

  useEffect(() => {
    const fetchApprovedRoutes = async () => {
      try {
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .select('*')
          .eq('status', 'approved')

        if (routeError) throw routeError
        if (!routeData || routeData.length === 0) {
          setAllRoutes(routesData)
          setVisibleRouteIds(new Set(routesData.map(r => r.id)))
          return
        }

        const routeIds = routeData.map(r => r.id)

        const { data: stopData, error: stopError } = await supabase
          .from('stops')
          .select('*')
          .in('route_id', routeIds)
          .order('order_index', { ascending: true })

        if (stopError) throw stopError

        const formattedRoutes = routeData.map(r => ({
          id: r.id,
          name: r.name,
          vehicleType: r.vehicle_type,
          color: r.color,
          pathCoordinates: typeof r.path_coordinates === 'string' ? JSON.parse(r.path_coordinates) : r.path_coordinates,
          stops: (stopData || [])
            .filter(s => s.route_id === r.id)
            .map(s => ({
              ...s,
              order: s.order_index
            }))
        }))

        setAllRoutes(prev => {
          // Keep pre-loaded routes json and merge new ones safely
          const all = [...prev]
          formattedRoutes.forEach(fr => {
            const idx = all.findIndex(a => a.id === fr.id)
            if (idx >= 0) all[idx] = fr
            else all.push(fr)
          })
          return all.filter(r => formattedRoutes.find(fr => fr.id === r.id) || prev.find(p => p.id === r.id && !p.created_at)) // KEEP local json routes, ONLY replace db ones
        })

        setVisibleRouteIds(prev => {
          const next = new Set(prev)
          formattedRoutes.forEach(r => next.add(r.id))
          return next
        })

      } catch (err) {
        console.error('Error fetching approved routes:', err)
      }
    }
    
    fetchApprovedRoutes()

    // Real-time synchronization
    const subscription = supabase
      .channel('public:routes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          // Remove the deleted route immediately
          setAllRoutes(prev => prev.filter(r => r.id !== payload.old.id))
          setVisibleRouteIds(prev => {
            const next = new Set(prev)
            next.delete(payload.old.id)
            return next
          })
          setSelectedRouteId(prev => prev === payload.old.id ? null : prev)
          setSearchResult(prev => {
            if (!prev) return null
            const newMatches = prev.matches.filter(m => m.routeId !== payload.old.id)
            return { ...prev, matches: newMatches }
          })
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
          // If a newly approved route appears, fetch it
          fetchApprovedRoutes()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const handleSearch = useCallback((from, to) => {
    const fromLower = from.toLowerCase().trim()
    const toLower = to.toLowerCase().trim()
    
    const matches = []
    
    allRoutes.forEach(route => {
      const stops = route.stops || []
      const fromIdx = stops.findIndex(s => s.name.toLowerCase().trim().includes(fromLower))
      const toIdx = stops.findIndex(s => s.name.toLowerCase().trim().includes(toLower))
      
      if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
        let totalFare = 0
        for (let i = fromIdx + 1; i <= toIdx; i++) {
          totalFare += Number(stops[i].fare_from_previous || 0)
        }
        
        matches.push({
          routeId: route.id,
          routeName: route.name,
          fare: totalFare,
          fromStop: stops[fromIdx],
          toStop: stops[toIdx]
        })
      }
    })
    
    setSearchResult({ from, to, matches })
    
    if (matches.length > 0) {
      setVisibleRouteIds(new Set(matches.map(m => m.routeId)))
      setSelectedRouteId(matches[0].routeId)
    } else {
      setVisibleRouteIds(new Set())
      setSelectedRouteId(null)
    }
  }, [allRoutes])

  const handleClearSearch = useCallback(() => {
    setSearchResult(null)
    setVisibleRouteIds(new Set(allRoutes.map(r => r.id)))
    setSelectedRouteId(null)
  }, [allRoutes])

  const selectedRoute = allRoutes.find(r => r.id === selectedRouteId) || null
  const currentNavMatch = searchResult?.matches.find(m => m.routeId === selectedRouteId)

  const handleSelectRoute = useCallback((routeId) => {
    setSelectedRouteId(prev => prev === routeId ? null : routeId)
  }, [])

  const handleToggleRoute = useCallback((routeId) => {
    setVisibleRouteIds(prev => {
      const next = new Set(prev)
      if (next.has(routeId)) {
        next.delete(routeId)
      } else {
        next.add(routeId)
      }
      return next
    })
  }, [])

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-700/50 shadow-lg shadow-black/20 hover:bg-slate-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static z-40 h-full
        w-80 shrink-0
        bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  TempoMetro
                </h1>
                <p className="text-xs text-slate-500">Kathmandu Transit Routes</p>
              </div>
            </div>
          </div>

          <div className="px-5 pt-6 pb-2">
            <RouteSearch 
              allRoutes={allRoutes} 
              onSearch={handleSearch} 
              onClear={handleClearSearch} 
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 pt-0">
            {searchResult && (
              <div className="px-2 mb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex justify-between items-center">
                  Search Results
                  <span className="text-blue-400 lowercase italic"> {searchResult.matches.length} found</span>
                </p>
                {searchResult.matches.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-500 font-medium">
                    No direct routes found.
                  </div>
                )}
              </div>
            )}
            
            <RouteSidebar
              routes={searchResult ? allRoutes.filter(r => searchResult.matches.some(m => m.routeId === r.id)) : allRoutes}
              selectedRouteId={selectedRouteId}
              visibleRouteIds={visibleRouteIds}
              onSelectRoute={(id) => {
                handleSelectRoute(id)
                setSidebarOpen(false)
              }}
              onToggleRoute={handleToggleRoute}
              searchResult={searchResult}
            />
          </div>

          {selectedRoute && (
            <RouteDetails 
              route={selectedRoute} 
              onClose={() => setSelectedRouteId(null)} 
              navMatch={currentNavMatch}
            />
          )}
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative">
        <RouteMap
          routes={allRoutes}
          selectedRouteId={selectedRouteId}
          visibleRouteIds={visibleRouteIds}
          navMatch={currentNavMatch}
        />
      </main>
    </div>
  )
}

export default App
