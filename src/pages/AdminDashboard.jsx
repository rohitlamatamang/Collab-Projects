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
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-950 overflow-hidden relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 right-6 z-[2000] bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          {toastMessage}
        </div>
      )}

      {/* Left Sidebar: Settings & Queue */}
      <div className="w-full md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 z-20 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mb-6">Manage platform transit data</p>
          
          {/* Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-2">
            <button 
              onClick={() => { setActiveTab('pending'); setSelectedRoute(null); }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Pending ({pendingRoutes.length})
            </button>
            <button 
              onClick={() => { setActiveTab('live'); setSelectedRoute(null); }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'live' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Live ({approvedRoutes.length})
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {isLoading && displayRoutes.length === 0 ? (
            // Skeletons
            [1, 2, 3].map(n => (
              <div key={n} className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-32 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                <div className="h-8 bg-slate-800 rounded-lg mt-4 w-full"></div>
              </div>
            ))
          ) : displayRoutes.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-3xl mb-2 block">{activeTab === 'pending' ? '🎉' : '🌐'}</span>
              <p className="text-slate-400 text-sm font-medium">No results found</p>
              <p className="text-slate-500 text-xs mt-1">
                {activeTab === 'pending' ? 'No routes waiting for review.' : 'No crowdsourced routes are live yet.'}
              </p>
            </div>
          ) : (
            displayRoutes.map(route => (
              <div 
                key={route.id} 
                className={`bg-slate-950 border ${selectedRoute?.id === route.id ? 'border-blue-500 shadow-lg shadow-blue-500/20 sticky top-0 md:static z-10' : 'border-slate-800 hover:border-slate-700'} transition-all rounded-xl p-4 cursor-pointer group flex flex-col`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                    {route.name}
                  </h3>
                  <span className="text-[9px] text-slate-500 shrink-0 ml-2 mt-0.5">
                    {formatDate(route.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: route.color }}></div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{route.vehicle_type}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    By <span className="font-semibold text-slate-300">{route.submitter_name || 'Anon'}</span>
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${selectedRoute?.id === route.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {activeTab === 'pending' ? 'Review & Edit' : 'View on Map'}
                  </button>
                  
                  {activeTab === 'live' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setRouteToDelete(route); }}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors group/del"
                      title="Delete Route"
                    >
                      <svg className="w-3.5 h-3.5 group-hover/del:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area: Map & Review Details */}
      <div className="flex-1 bg-slate-950 relative flex items-center justify-center z-10">
        {selectedRoute ? (
          <AdminReviewMap route={selectedRoute} onActionComplete={handleActionComplete} readOnly={activeTab === 'live'} />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <svg className="w-16 h-16 text-slate-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            <h3 className="text-lg font-bold text-slate-300 mb-2">Select a Route</h3>
            <p className="text-slate-500 text-xs">
              {activeTab === 'pending' 
                ? "Click on any pending route from the queue to visually review its drawn path and stops on the map."
                : "Select a live route to inspect its path and details. You can delete it using the trash icon in the sidebar."
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
