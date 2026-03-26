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
    <div className="h-full w-full bg-slate-950 text-slate-100 flex relative overflow-hidden">
      
      {/* Map Area - Now truly full screen underneath everything */}
      <main className="absolute inset-0 z-0">
        <RouteMap
          routes={allRoutes}
          selectedRouteId={selectedRouteId}
          visibleRouteIds={visibleRouteIds}
          navMatch={currentNavMatch}
        />
      </main>

      {/* Sidebar / Floating Bottom Sheet */}
      <aside className={`
        fixed md:static z-40
        bottom-4 left-2 right-2 rounded-3xl border overflow-hidden
        md:bottom-auto md:left-auto md:right-auto md:h-full md:w-[400px] md:border-y-0 md:border-l-0 md:border-r md:rounded-none
        bg-slate-900/85 backdrop-blur-2xl border-white/10 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] md:shadow-2xl
        flex flex-col transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'h-[75vh] bottom-4' : 'h-[38vh] bottom-4'} md:h-full
      `}>
        {/* Mobile Drag Handle / Expand Toggle */}
        <div 
          className="md:hidden w-full flex items-center justify-center pt-3 pb-1 cursor-pointer active:bg-white/5"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 md:p-6 pb-4 shrink-0">
            <div className="flex items-center gap-4 hidden md:flex mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent transform scale-y-105">
                  TempoMetro
                </h1>
                <p className="text-[11px] font-medium text-slate-400 tracking-wide">KATHMANDU TRANSIT NETWORK</p>
              </div>
            </div>

            <RouteSearch 
              allRoutes={allRoutes} 
              onSearch={handleSearch} 
              onClear={handleClearSearch} 
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar md:custom-scrollbar p-3 pt-0 relative">
            {searchResult && (
              <div className="px-3 mb-4 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 py-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex justify-between items-center">
                  Search Results
                  <span className="text-blue-400 lowercase italic"> {searchResult.matches.length} found</span>
                </p>
                {searchResult.matches.length === 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-500 font-medium mt-2">
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
                // Optional: expand sheet on mobile if they click a route to see details
                if (!sidebarOpen) setSidebarOpen(true)
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
    </div>
  )
}

export default App
