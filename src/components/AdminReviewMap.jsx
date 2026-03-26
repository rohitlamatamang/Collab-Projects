import { useState, useEffect, useMemo, useCallback } from 'react'
import { GoogleMap, Polyline, Marker, OverlayView } from '@react-google-maps/api'
import { supabase } from '../lib/supabase'

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

export default function AdminReviewMap({ route, onActionComplete, readOnly = false }) {
  const [stops, setStops] = useState([])
  const [isLoadingStops, setIsLoadingStops] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Local state for dragging nodes
  const [editablePath, setEditablePath] = useState([])
  const [map, setMap] = useState(null)

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance)
  }, [])

  useEffect(() => {
    if (!route) return
    
    const parsedPath = typeof route.path_coordinates === 'string' 
      ? JSON.parse(route.path_coordinates) 
      : route.path_coordinates
    setEditablePath(parsedPath || [])
    setIsEditMode(false)

    const fetchStops = async () => {
      setIsLoadingStops(true)
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .eq('route_id', route.id)
        .order('order_index', { ascending: true })

      if (!error && data) {
        setStops(data)
      }
      setIsLoadingStops(false)
    }

    fetchStops()
  }, [route])

  // Fit bounds when path loads
  useEffect(() => {
    if (map && editablePath && editablePath.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds()
      editablePath.forEach(coord => bounds.extend(new window.google.maps.LatLng(coord[0], coord[1])))
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 })
    }
  }, [map, editablePath])

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('routes')
        .update({ 
          status: newStatus,
          path_coordinates: JSON.stringify(editablePath) 
        })
        .eq('id', route.id)

      if (error) throw error
      onActionComplete(route.id, newStatus)
    } catch (err) {
      console.error(err)
      alert('Failed to update route: ' + err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDragNode = (idx, latLng) => {
    if (!latLng) return
    setEditablePath(prev => {
      const newPath = [...prev]
      newPath[idx] = [latLng.lat(), latLng.lng()]
      return newPath
    })
  }

  const googlePath = useMemo(() => editablePath.map(c => ({ lat: c[0], lng: c[1] })), [editablePath])

  if (!route) return null

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      
      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={KATHMANDU_CENTER}
          zoom={13}
          onLoad={onLoad}
          options={{
            styles: CARTO_DARK_MATTER_STYLE,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {googlePath && googlePath.length > 0 && (
            <>
              {/* Path Polyline */}
              {/* Note: Google Maps Polylines do not natively support dashArray styling easily, so we just use opacity for edit mode */}
              <Polyline 
                path={googlePath}
                options={{
                  strokeColor: route.color,
                  strokeWeight: 5,
                  strokeOpacity: isEditMode ? 0.4 : 0.8,
                  clickable: false
                }}
              />
              
              {/* Vertex dots (Draggable if Edit Mode) */}
              {editablePath.map((coord, idx) => {
                if (isEditMode) {
                  return (
                    <Marker 
                      key={`path-edit-${idx}`} 
                      position={{ lat: coord[0], lng: coord[1] }}
                      draggable={true}
                      onDragEnd={(e) => handleDragNode(idx, e.latLng)}
                    />
                  )
                }

                return (
                  <CustomHTMLMarker key={`path-${idx}`} lat={coord[0]} lng={coord[1]}>
                    <div className="w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-md pointer-events-none" />
                  </CustomHTMLMarker>
                )
              })}
            </>
          )}

          {stops.map((stop, idx) => (
            <CustomHTMLMarker key={`stop-${stop.id}`} lat={stop.lat} lng={stop.lng}>
              <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white pointer-events-none" style={{ backgroundColor: route.color }}>
                {idx + 1}
              </div>
            </CustomHTMLMarker>
          ))}
        </GoogleMap>

        {/* Floating Route Info Header w/ Actions */}
        <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 p-5 rounded-2xl shadow-2xl max-w-sm w-full">
          
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-xl font-bold text-white leading-tight">{route.name}</h2>
            {!readOnly && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all border ${isEditMode ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 hover:bg-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
              >
                {isEditMode ? 'Lock Path' : 'Edit Path'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }}></div>
            <span className="text-xs font-semibold text-slate-300">{route.vehicle_type}</span>
          </div>

          {isEditMode && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg flex items-start gap-2">
              <span className="text-amber-500 text-lg leading-none mt-0.5">✋</span>
              <p className="text-[10px] text-amber-400 font-medium leading-tight">
                **Edit Mode Active:** Drag the red markers on the map to realign this route perfectly to the major roads before saving.
              </p>
            </div>
          )}

          <div className="flex items-center gap-6 text-xs mb-6 border-b border-slate-800 pb-4">
            <div>
              <span className="block text-slate-500 mb-0.5">Points</span>
              <span className="font-bold text-white">{editablePath?.length || 0}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-0.5">Stops</span>
              <span className="font-bold text-white">{stops.length}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="flex gap-3">
              <button 
                onClick={() => handleUpdateStatus('rejected')}
                disabled={isUpdating}
                className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Reject
              </button>
              <button 
                onClick={() => handleUpdateStatus('approved')}
                disabled={isUpdating}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex justify-center items-center disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Approve & Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stops Timeline Gallery */}
      <div className="h-48 bg-slate-950 border-t border-slate-800 p-4 shrink-0 overflow-y-auto custom-scrollbar relative z-[1000]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Route Timeline</h3>
        
        {isLoadingStops ? (
          <div className="text-center text-sm text-slate-500 py-4 font-medium animate-pulse">Loading stops from database...</div>
        ) : stops.length === 0 ? (
          <div className="text-center text-sm text-amber-500/70 py-4 font-medium">Warning: No stops were provided for this route.</div>
        ) : (
          <div className="flex gap-4 min-w-max pb-2">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl w-48 shrink-0 flex items-center gap-3 relative z-[1010]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg shrink-0" style={{ backgroundColor: route.color }}>
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate leading-tight mb-0.5" title={stop.name}>{stop.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Fare: <span className="text-emerald-400">Rs {stop.fare_from_previous}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
