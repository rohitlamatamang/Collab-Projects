import { useState, useMemo } from 'react'
import { GoogleMap, Polyline, OverlayView } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle2, ArrowLeft, Undo2, Trash2, Plus, Loader2, MapPin } from 'lucide-react'

const KATHMANDU_CENTER = { lat: 27.7172, lng: 85.3240 }

const CARTO_DARK_MATTER_STYLE = []

function CustomHTMLMarker({ lat, lng, children }) {
  const position = useMemo(() => ({ lat, lng }), [lat, lng])
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
      })}
    >
      {children}
    </OverlayView>
  )
}

export default function ContributionMap({ routeData, onCancel, prefillData }) {
  const navigate = useNavigate()
  const [draftCoordinates, setDraftCoordinates] = useState(prefillData?.coords || [])
  const [stops, setStops] = useState(prefillData?.stops || [])
  
  // Stop Modal State
  const [isAddingStop, setIsAddingStop] = useState(false)
  const [newStopName, setNewStopName] = useState('')
  const [newStopFare, setNewStopFare] = useState(0)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Memoized values - MUST be before any conditional returns
  const googlePath = useMemo(() => draftCoordinates.map(c => ({ lat: c[0], lng: c[1] })), [draftCoordinates])

  const handleMapClick = (e) => {
    // Only allow drawing if not currently adding a stop
    if(!isAddingStop && !isSubmitting && !submitSuccess && e.latLng) {
      setDraftCoordinates(prev => [...prev, [e.latLng.lat(), e.latLng.lng()]])
    }
  }

  const handleUndo = () => {
    setDraftCoordinates(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    if(window.confirm("Clear entire drawn path and stops?")) {
      setDraftCoordinates([])
      setStops([])
    }
  }

  const handleDeleteStop = (idx) => {
    setStops(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSaveStop = () => {
    if(!newStopName) return alert("Stop name required")
    if(draftCoordinates.length === 0) return alert("Draw at least one point on the map first to snap the stop to.")

    const latlng = draftCoordinates[draftCoordinates.length - 1]

    setStops(prev => [...prev, {
      name: newStopName,
      fare: parseFloat(newStopFare) || 0,
      lat: latlng[0],
      lng: latlng[1],
      order: prev.length + 1
    }])

    setIsAddingStop(false)
    setNewStopName('')
    setNewStopFare(0)
  }

  const handleSubmitRoute = async () => {
    if(draftCoordinates.length < 2 || stops.length < 2) return
    setIsSubmitting(true)
    setSubmitError('')

    console.log('Submitting route...', { draftCoordinates, stops, routeData })

    try {
      // 1. Insert Route
      const { data: routeResult, error: routeError } = await supabase
        .from('routes')
        .insert({
          name: routeData.routeName,
          vehicle_type: routeData.vehicleType,
          color: routeData.color,
          submitter_name: routeData.submitterName,
          path_coordinates: draftCoordinates,
          status: 'pending'
        })
        .select()
        .single()

      console.log('Route insert result:', { routeResult, routeError })

      if (routeError) {
        console.error('Route error details:', routeError)
        throw new Error("Failed to save route: " + (routeError.message || routeError.code || 'Unknown error'))
      }

      if (!routeResult) {
        throw new Error("No route data returned from database")
      }

      const newRouteId = routeResult.id

      // 2. Prepare Stops
      const stopsToInsert = stops.map(stop => ({
        route_id: newRouteId,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        order_index: stop.order,
        fare_from_previous: stop.fare
      }))

      console.log('Inserting stops...', stopsToInsert)

      // 3. Insert Stops
      const { error: stopsError } = await supabase
        .from('stops')
        .insert(stopsToInsert)

      console.log('Stops insert result:', { stopsError })

      if (stopsError) {
        console.error('Stops error details:', stopsError)
        throw new Error("Failed to save stops: " + (stopsError.message || stopsError.code || 'Unknown error'))
      }

      // Success
      console.log('Route submitted successfully!')
      setIsSubmitting(false)
      setSubmitSuccess(true)

    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError(err.message || 'An unknown error occurred. Check browser console for details.')
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 p-6">
        <Card className="max-w-sm w-full text-center border-emerald-500/30">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Route Submitted</h2>
            <p className="text-slate-400 text-sm mb-6">Your route has been sent to the admins for review. It will appear on the public map once approved.</p>
            <Button
              onClick={() => navigate('/admin')}
              className="w-full"
            >
              Go to Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col md:flex-row bg-slate-950 overflow-hidden">
      
      {/* Map Area - Full Screen Base */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={KATHMANDU_CENTER}
          zoom={13}
          onClick={handleMapClick}
          options={{
            styles: CARTO_DARK_MATTER_STYLE,
            disableDefaultUI: true,
            zoomControl: true,
            draggableCursor: 'crosshair'
          }}
        >
          {/* Draw the drafted line */}
          {googlePath.length > 0 && (
            <Polyline 
              path={googlePath}
              options={{
                strokeColor: routeData.color,
                strokeWeight: 5,
                strokeOpacity: 0.8,
                clickable: false
              }}
            />
          )}

          {/* Draw dots at clicked vertices */}
          {draftCoordinates.map((coord, idx) => (
            <CustomHTMLMarker key={`dot-${idx}`} lat={coord[0]} lng={coord[1]}>
              <div className="w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-md pointer-events-none" />
            </CustomHTMLMarker>
          ))}

          {/* Draw numbered Stop markers */}
          {stops.map((stop, idx) => (
            <CustomHTMLMarker key={`stop-${idx}`} lat={stop.lat} lng={stop.lng}>
              <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white pointer-events-none" style={{ backgroundColor: routeData.color }}>
                {idx + 1}
              </div>
            </CustomHTMLMarker>
          ))}
        </GoogleMap>
      </div>

      {/* Floating Tools Panel */}
      <div className="absolute z-[400] md:top-6 md:right-6 md:w-[360px] md:bottom-auto bottom-[80px] left-3 right-3 bg-slate-900/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col rounded-3xl overflow-hidden max-h-[55vh] md:max-h-[calc(100vh-100px)]">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-white/5 bg-slate-800/20">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onCancel} className="text-slate-400 hover:text-white p-1.5 hover:bg-white/10 rounded-xl transition-all active:scale-90 bg-slate-800/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white truncate leading-tight">{routeData.routeName || 'New Route'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-slate-800/80 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-white/5">{routeData.vehicleType}</span>
                <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: routeData.color }} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleUndo} disabled={draftCoordinates.length === 0 || isSubmitting} className="flex-1 py-2.5 bg-slate-800/50 hover:bg-slate-700/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl border border-white/5 transition-all active:scale-[0.98]">
              Undo Last
            </button>
            <button onClick={handleClear} disabled={draftCoordinates.length === 0 || isSubmitting} className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/20 transition-all active:scale-[0.98]">
              Clear All
            </button>
          </div>
        </div>

        {/* Stops Panel */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar md:custom-scrollbar">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Stops</h3>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">{stops.length} Added</span>
          </div>
          
          <button 
            onClick={() => setIsAddingStop(true)}
            disabled={draftCoordinates.length === 0 || isSubmitting}
            className="w-full py-3 mb-4 border border-dashed border-slate-600 hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-blue-400 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add Stop at Last Pin
          </button>
          
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 flex items-center gap-3 group relative transition-colors hover:bg-slate-800/80">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner" style={{ backgroundColor: routeData.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-sm font-semibold text-white truncate">{stop.name}</p>
                  <p className="text-[11px] font-medium text-emerald-400 mt-0.5">Rs {stop.fare} from prev</p>
                </div>
                <button disabled={isSubmitting} onClick={() => handleDeleteStop(idx)} className="opacity-0 group-hover:opacity-100 disabled:opacity-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 transition-all absolute right-2 bg-slate-800/80 rounded-xl active:scale-90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          {stops.length === 0 && (
            <div className="text-center text-xs font-medium text-slate-500 mt-6 px-4 pb-4">
              Tap the map to draw the path line.<br/><br/>Then click "Add Stop" to convert your latest map tap into a station.
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md">
           {submitError && (
             <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[11px] font-medium">
               {submitError}
             </div>
           )}
           <button 
              onClick={handleSubmitRoute}
              disabled={draftCoordinates.length < 2 || stops.length < 2 || isSubmitting}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Database...
                </>
              ) : 'Submit Route'}
            </button>
            {(draftCoordinates.length < 2 || stops.length < 2) && (
              <p className="text-[10px] font-medium text-center text-amber-500/80 mt-2">Requires mapping at least 2 points & 2 stops.</p>
            )}
        </div>
      </div>

      {/* Modal Overlay for Adding Stop */}
      {isAddingStop && (
        <div className="absolute inset-0 z-[5000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 p-6 rounded-[2rem] shadow-2xl w-full max-w-sm transform transition-all">
            <h3 className="text-xl font-bold text-white mb-2">Add Route Stop</h3>
            <p className="text-[11px] font-medium text-slate-400 mb-6 leading-relaxed">This stop will be pinned exactly at your last tapped location on the map.</p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Station Name</label>
                <input type="text" value={newStopName} onChange={(e) => setNewStopName(e.target.value)} placeholder="e.g. Ratnapark" className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Fare From Previous Stop</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">Rs</span>
                  <input type="number" min="0" value={newStopFare} onChange={(e) => setNewStopFare(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-10 pr-5 py-3.5 text-sm text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all shadow-inner" />
                </div>
                {stops.length === 0 && <p className="text-[10px] font-medium text-emerald-400/80 mt-2 px-1">First stop should normally be Rs 0.</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsAddingStop(false)} className="flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-white/5 transition-all active:scale-[0.98]">Cancel</button>
              <button onClick={handleSaveStop} className="flex-1 py-3.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]">Save Stop</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
