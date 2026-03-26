import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'

// Custom marker for drawing path (small dot)
const pathIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-md"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

// Custom marker for Stops (larger circle)
const createStopIcon = (color, index) => L.divIcon({
  className: 'custom-stop-icon',
  html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white relative z-10" style="background-color: ${color}">${index}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

export default function ContributionMap({ routeData, onCancel, prefillData }) {
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

  const handleMapClick = (latlng) => {
    // Only allow drawing if not currently adding a stop
    if(!isAddingStop && !isSubmitting && !submitSuccess) {
      setDraftCoordinates(prev => [...prev, latlng])
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

    try {
      // 1. Insert Route
      const { data: routeResult, error: routeError } = await supabase
        .from('routes')
        .insert({
          name: routeData.routeName,
          vehicle_type: routeData.vehicleType,
          color: routeData.color,
          submitter_name: routeData.submitterName,
          path_coordinates: draftCoordinates, // Automatically JSON serialized
          status: 'pending'
        })
        .select()
        .single()

      if (routeError) throw new Error("Failed to save route: " + routeError.message)

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

      // 3. Insert Stops
      const { error: stopsError } = await supabase
        .from('stops')
        .insert(stopsToInsert)

      if (stopsError) throw new Error("Failed to save stops: " + stopsError.message)

      // Success
      setSubmitSuccess(true)
      setTimeout(() => {
        onCancel() // Go back to landing page
      }, 3000)

    } catch (err) {
      console.error(err)
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Route Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">Your route has been sent to the admins for review. It will appear on the public map once approved.</p>
          <p className="text-xs text-slate-500">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-slate-950 relative">
      
      {/* Modal Overlay for Adding Stop */}
      {isAddingStop && (
        <div className="absolute inset-0 z-[3000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Add Route Stop</h3>
            <p className="text-xs text-slate-400 mb-6">This stop will be placed at the last point you tapped on the map.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stop Name</label>
                <input type="text" value={newStopName} onChange={(e) => setNewStopName(e.target.value)} placeholder="e.g. Ratnapark" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fare from previous (Rs)</label>
                <input type="number" min="0" value={newStopFare} onChange={(e) => setNewStopFare(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
                {stops.length === 0 && <p className="text-[10px] text-slate-500 mt-1">First stop is usually Rs 0.</p>}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setIsAddingStop(false)} className="flex-1 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl">Cancel</button>
              <button onClick={handleSaveStop} className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">Save Stop</button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Sidebar */}
      <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onCancel} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-lg font-bold text-white truncate">{routeData.routeName || 'New Route'}</h2>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 bg-slate-800 rounded-md text-xs font-medium text-slate-300 border border-slate-700">{routeData.vehicleType}</span>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: routeData.color }} />
          </div>

          <div className="flex gap-2">
            <button onClick={handleUndo} disabled={draftCoordinates.length === 0 || isSubmitting} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl border border-slate-700 transition-all">
              Undo Point
            </button>
            <button onClick={handleClear} disabled={draftCoordinates.length === 0 || isSubmitting} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-xl border border-red-500/20 transition-all">
              Clear
            </button>
          </div>
        </div>

        {/* Phase 4: Stops Panel */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Route Stops</h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{stops.length}</span>
          </div>
          
          <button 
            onClick={() => setIsAddingStop(true)}
            disabled={draftCoordinates.length === 0 || isSubmitting}
            className="w-full py-3 mb-6 border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 hover:text-blue-400 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Stop at Last Point
          </button>
          
          <div className="space-y-3">
            {stops.map((stop, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3 group relative">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: routeData.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{stop.name}</p>
                  <p className="text-xs text-slate-400">+ Rs {stop.fare}</p>
                </div>
                <button disabled={isSubmitting} onClick={() => handleDeleteStop(idx)} className="opacity-0 group-hover:opacity-100 disabled:opacity-0 text-red-400 hover:text-red-300 p-2 transition-opacity absolute right-2 bg-slate-900 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          {stops.length === 0 && (
            <div className="text-center text-sm text-slate-600 mt-4 px-4">
              Draw the path first, then click "Add Stop" to drop a pin at your latest point.
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="p-4 border-t border-slate-800">
           {submitError && (
             <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
               {submitError}
             </div>
           )}
           <button 
              onClick={handleSubmitRoute}
              disabled={draftCoordinates.length < 2 || stops.length < 2 || isSubmitting}
              className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving to Database...
                </>
              ) : 'Submit Route'}
            </button>
            {(draftCoordinates.length < 2 || stops.length < 2) && (
              <p className="text-[10px] text-center text-slate-500 mt-2">Requires mapping at least 2 points & 2 stops.</p>
            )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={[27.7172, 85.3240]} // Kathmandu
          zoom={13} 
          className="w-full h-full bg-slate-900"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Draw the drafted line */}
          {draftCoordinates.length > 0 && (
            <Polyline 
              positions={draftCoordinates} 
              color={routeData.color} 
              weight={4} 
              opacity={0.8}
            />
          )}

          {/* Draw dots at clicked vertices */}
          {draftCoordinates.map((coord, idx) => (
            <Marker key={idx} position={coord} icon={pathIcon} />
          ))}

          {/* Draw numbered Stop markers */}
          {stops.map((stop, idx) => (
            <Marker key={idx} position={[stop.lat, stop.lng]} icon={createStopIcon(routeData.color, idx + 1)} />
          ))}

        </MapContainer>
      </div>

    </div>
  )
}
