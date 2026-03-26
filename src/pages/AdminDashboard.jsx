import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminReviewMap from '../components/AdminReviewMap'

function AdminDashboard() {
  const [pendingRoutes, setPendingRoutes] = useState([])
  const [approvedRoutes, setApprovedRoutes] = useState([])
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'live'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [routeToDelete, setRouteToDelete] = useState(null)

  useEffect(() => {
    fetchAllRoutes()
  }, [])

  const fetchAllRoutes = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const { data: pData, error: pError } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      const { data: aData, error: aError } = await supabase
        .from('routes')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (pError) throw pError
      if (aError) throw aError

      setPendingRoutes(pData || [])
      setApprovedRoutes(aData || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActionComplete = (routeId, newStatus) => {
    // Move route between lists
    if (newStatus === 'approved') {
      const approved = pendingRoutes.find(r => r.id === routeId)
      if (approved) setApprovedRoutes(prev => [{...approved, status: 'approved'}, ...prev])
    }
    setPendingRoutes(prev => prev.filter(r => r.id !== routeId))
    
    // Clear selection
    setSelectedRoute(null)
    setToastMessage(`Route successfully ${newStatus}!`)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const executeDelete = async () => {
    if (!routeToDelete) return
    const routeId = routeToDelete.id

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId)
        .select()

      if (error) throw error
      if (!data || data.length === 0) {
        throw new Error("Row was not deleted. Please ensure you have added the DELETE policy to the 'routes' table in Supabase.")
      }

      setApprovedRoutes(prev => prev.filter(r => r.id !== routeId))
      if (selectedRoute?.id === routeId) setSelectedRoute(null)
      
      setRouteToDelete(null)
      setToastMessage("Route deleted successfully!")
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setError("Failed to delete: " + err.message)
      setRouteToDelete(null)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    })
  }

  const displayRoutes = activeTab === 'pending' ? pendingRoutes : approvedRoutes

  return (
    <div className="h-full w-full flex flex-col-reverse md:flex-row bg-slate-950 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 right-6 z-[2000] bg-emerald-500/90 backdrop-blur-md border border-emerald-400/50 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}

      {/* Settings & Queue Panel (Bottom half on mobile, left on desktop) */}
      <div className="w-full h-[55%] md:h-full md:w-[420px] bg-slate-900/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 flex flex-col shrink-0 z-20 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 shrink-0 bg-slate-800/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-0.5 tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">TempoMetro Network Area</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setActiveTab('pending'); setSelectedRoute(null); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'pending' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Pending ({pendingRoutes.length})
            </button>
            <button 
              onClick={() => { setActiveTab('live'); setSelectedRoute(null); }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'live' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Live ({approvedRoutes.length})
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar md:custom-scrollbar space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {isLoading && displayRoutes.length === 0 ? (
            // Premium Skeletons
            [1, 2, 3].map(n => (
              <div key={n} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 h-36 animate-pulse flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-white/10 rounded-lg w-2/3 mb-2" />
                  <div className="h-4 bg-white/5 rounded-lg w-1/4" />
                </div>
                <div className="h-3 bg-white/5 rounded-lg w-1/3" />
                <div className="h-10 bg-white/5 rounded-xl mt-4 w-full" />
              </div>
            ))
          ) : displayRoutes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <span className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-4xl mb-6 shadow-inner border border-white/5">
                {activeTab === 'pending' ? '🎉' : '🌐'}
              </span>
              <p className="text-white text-base font-bold mb-2">No results found</p>
              <p className="text-slate-400 text-sm">
                {activeTab === 'pending' ? 'Hooray! No new routes waiting for review.' : 'No crowdsourced routes have been approved yet.'}
              </p>
            </div>
          ) : (
            displayRoutes.map(route => (
              <div 
                key={route.id} 
                className={`bg-slate-900/60 backdrop-blur-md border ${selectedRoute?.id === route.id ? 'border-blue-500/50 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)] sticky top-0 md:static z-10 scale-[1.02]' : 'border-white/5 hover:border-white/10 hover:bg-slate-800/80'} transition-all duration-300 rounded-2xl p-5 cursor-pointer group flex flex-col`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 pr-4">
                    {route.name}
                  </h3>
                  <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 shrink-0 mt-0.5 bg-slate-950/50 px-2 py-1 rounded-md">
                    {formatDate(route.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-5 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: route.color }}></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{route.vehicle_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-800/50 px-2 py-1 rounded-lg">
                     <span className="text-slate-300 font-bold">{route.submitter_name || 'Anon'}</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-[0.98] ${selectedRoute?.id === route.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25' : 'bg-slate-800 border border-white/5 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {activeTab === 'pending' ? 'Review Details' : 'View on Map'}
                  </button>
                  
                  {activeTab === 'live' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRouteToDelete(route); }}
                      className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-xl transition-all active:scale-[0.98] group/del flex items-center justify-center shadow-sm"
                      title="Delete Route"
                    >
                      <svg className="w-4 h-4 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right/Top Area: Map & Review Details */}
      <div className="flex-1 h-[45%] md:h-full bg-slate-950 relative flex items-center justify-center z-10 shrink-0 md:shrink">
        {selectedRoute ? (
          <AdminReviewMap route={selectedRoute} onActionComplete={handleActionComplete} readOnly={activeTab === 'live'} />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-6 transform rotate-3">
              <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Select a Route</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {activeTab === 'pending' 
                ? "Tap on any pending route from the queue to visually review its drawn path and stop fare data."
                : "Select a live route to inspect its path. You can permanently delete it using the trash icon in the list."
              }
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {routeToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[3000] flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Route?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to permanently delete <span className="text-white font-bold">{routeToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setRouteToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20 flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : 'Delete Route'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard
