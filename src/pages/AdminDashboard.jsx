import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AdminReviewMap from '../components/AdminReviewMap'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Spinner } from '../components/ui/spinner'
import { Shield, Map, CheckCircle2, Trash2, Eye, Clock, User, Pencil, Upload } from 'lucide-react'
import routesData from '../data/routes.json'

function AdminDashboard() {
  const [pendingRoutes, setPendingRoutes] = useState([])
  const [approvedRoutes, setApprovedRoutes] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [routeToDelete, setRouteToDelete] = useState(null)
  const [editingLiveRoute, setEditingLiveRoute] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Seed hardcoded routes into Supabase
  const seedHardcodedRoutes = async () => {
    setIsSeeding(true)
    try {
      for (const route of routesData) {
        // Check if route already exists
        const { data: existing } = await supabase
          .from('routes')
          .select('id')
          .eq('name', route.name)
          .single()

        if (existing) {
          console.log(`Route "${route.name}" already exists, skipping...`)
          continue
        }

        // Insert the route
        const { data: newRoute, error: routeError } = await supabase
          .from('routes')
          .insert({
            name: route.name,
            vehicle_type: route.vehicleType,
            color: route.color,
            path_coordinates: JSON.stringify(route.pathCoordinates),
            status: 'approved',
            submitter_name: 'System'
          })
          .select()
          .single()

        if (routeError) {
          console.error(`Failed to insert route "${route.name}":`, routeError)
          continue
        }

        // Insert stops for this route
        const stopsToInsert = route.stops.map((stop, idx) => ({
          route_id: newRoute.id,
          name: stop.name,
          lat: stop.lat,
          lng: stop.lng,
          order_index: idx,
          fare_from_previous: stop.fare_from_previous || (idx === 0 ? 0 : 15)
        }))

        const { error: stopsError } = await supabase
          .from('stops')
          .insert(stopsToInsert)

        if (stopsError) {
          console.error(`Failed to insert stops for "${route.name}":`, stopsError)
        }
      }

      // Refresh routes
      await fetchAllRoutes()
      setToastMessage('Hardcoded routes added successfully')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err) {
      console.error('Seed error:', err)
      setError('Failed to seed routes: ' + err.message)
    } finally {
      setIsSeeding(false)
    }
  }

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

  const handleActionComplete = (routeId, newStatus, updatedPath) => {
    if (newStatus === 'approved') {
      const approved = pendingRoutes.find(r => r.id === routeId)
      if (approved) setApprovedRoutes(prev => [{...approved, status: 'approved'}, ...prev])
      setPendingRoutes(prev => prev.filter(r => r.id !== routeId))
    } else if (newStatus === 'updated') {
      // Update the route in approvedRoutes with new path
      setApprovedRoutes(prev => prev.map(r =>
        r.id === routeId ? { ...r, path_coordinates: updatedPath } : r
      ))
      setEditingLiveRoute(false)
    } else {
      setPendingRoutes(prev => prev.filter(r => r.id !== routeId))
    }
    setSelectedRoute(null)
    setToastMessage(`Route successfully ${newStatus}`)
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
        throw new Error("Row was not deleted. Please ensure you have added the DELETE policy.")
      }

      setApprovedRoutes(prev => prev.filter(r => r.id !== routeId))
      if (selectedRoute?.id === routeId) setSelectedRoute(null)

      setRouteToDelete(null)
      setToastMessage("Route deleted successfully")
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
        <div className="absolute top-6 right-6 z-[2000] bg-emerald-500/90 backdrop-blur-md border border-emerald-400/50 text-white font-bold px-6 py-3 rounded-xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Left Panel */}
      <div className="w-full h-[55%] md:h-full md:w-[420px] bg-slate-900/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 flex flex-col shrink-0 z-20">

        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/5 shrink-0 bg-slate-800/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-0.5 tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">TempoMetro Network</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedRoute(null); setEditingLiveRoute(false); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'pending' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Pending ({pendingRoutes.length})
            </button>
            <button
              onClick={() => { setActiveTab('live'); setSelectedRoute(null); setEditingLiveRoute(false); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'live' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              Live ({approvedRoutes.length})
            </button>
          </div>

          {/* Seed Hardcoded Routes Button */}
          {activeTab === 'live' && approvedRoutes.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={seedHardcodedRoutes}
              disabled={isSeeding}
              className="w-full mt-3 text-[10px] uppercase tracking-wider"
            >
              {isSeeding ? <Spinner size="sm" className="mr-2" /> : <Upload className="w-3 h-3 mr-2" />}
              {isSeeding ? 'Adding Routes...' : 'Add Default Routes'}
            </Button>
          )}
        </div>

        {/* Route List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar md:custom-scrollbar space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && displayRoutes.length === 0 ? (
            [1, 2, 3].map(n => (
              <div key={n} className="bg-slate-900/60 border border-white/5 rounded-xl p-5 h-36 animate-pulse flex flex-col justify-between">
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
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                {activeTab === 'pending' ? <CheckCircle2 className="w-8 h-8 text-slate-600" /> : <Map className="w-8 h-8 text-slate-600" />}
              </div>
              <p className="text-white text-base font-bold mb-2">No routes found</p>
              <p className="text-slate-400 text-sm">
                {activeTab === 'pending' ? 'No new routes waiting for review.' : 'No crowdsourced routes have been approved yet.'}
              </p>
            </div>
          ) : (
            displayRoutes.map(route => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all duration-200 ${selectedRoute?.id === route.id ? 'border-blue-500/50 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.3)]' : 'hover:border-white/20 hover:bg-slate-800/50'}`}
                onClick={() => { setSelectedRoute(route); setEditingLiveRoute(false); }}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 pr-4">
                      {route.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0 text-[9px]">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(route.created_at)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{route.vehicle_type}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      <User className="w-3 h-3 mr-1" />
                      {route.submitter_name || 'Anonymous'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={selectedRoute?.id === route.id ? 'default' : 'secondary'}
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      {activeTab === 'pending' ? 'Review' : 'View'}
                    </Button>

                    {activeTab === 'live' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoute(route);
                            setEditingLiveRoute(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setRouteToDelete(route); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 h-[45%] md:h-full bg-slate-950 relative flex items-center justify-center z-10">
        {selectedRoute ? (
          <AdminReviewMap
            route={selectedRoute}
            onActionComplete={handleActionComplete}
            readOnly={activeTab === 'live' && !editingLiveRoute}
            isLiveEdit={activeTab === 'live' && editingLiveRoute}
          />
        ) : (
          <div className="text-center p-8 max-w-sm">
            <div className="w-20 h-20 bg-slate-900 border border-white/5 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6">
              <Map className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Select a Route</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {activeTab === 'pending'
                ? "Tap on any pending route to review its path and stop data."
                : "Select a live route to inspect its path on the map."
              }
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!routeToDelete} onOpenChange={() => setRouteToDelete(null)}>
        <DialogContent onClose={() => setRouteToDelete(null)}>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <span className="text-white font-semibold">{routeToDelete?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setRouteToDelete(null)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default AdminDashboard
