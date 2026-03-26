import { useEffect, useState, useMemo } from 'react'
import { Polyline, OverlayView } from '@react-google-maps/api'

// We create a generic overlay component for custom HTML markers like stops
function CustomMarker({ lat, lng, children }) {
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

function RouteLayer({ route, isSelected, navMatch, map }) {
  const [curvedPath, setCurvedPath] = useState(null)
  const [navPath, setNavPath] = useState(null) // Path specifically for the navMatch

  // Calculate generic directions for this route along curved roads
  useEffect(() => {
    if (!route || !route.stops || route.stops.length < 2 || !window.google) return

    const cacheKey = `directions_${route.id}`
    // Basic caching to save quota if toggled
    if (window[cacheKey]) {
      setCurvedPath(window[cacheKey])
      return
    }

    const directionsService = new window.google.maps.DirectionsService()

    const origin = { lat: route.stops[0].lat, lng: route.stops[0].lng }
    const destination = {
      lat: route.stops[route.stops.length - 1].lat,
      lng: route.stops[route.stops.length - 1].lng
    }
    const waypoints = route.stops.slice(1, -1).map(stop => ({
      location: { lat: stop.lat, lng: stop.lng },
      stopover: true
    }))

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          // Extract the curved route polyline from the result overview path
          const path = result.routes[0].overview_path.map(p => ({
            lat: p.lat(),
            lng: p.lng()
          }))
          setCurvedPath(path)
          window[cacheKey] = path // Cache it locally
        } else {
          console.error(`Error requesting directions for ${route.id}: ${status}`)
          // Fallback to straight lines if error
          setCurvedPath(route.stops.map(s => ({ lat: s.lat, lng: s.lng })))
        }
      }
    )
  }, [route])

  // Extract navigation segment if navMatch exists
  useEffect(() => {
    if (!navMatch || !curvedPath || curvedPath.length === 0) {
      setNavPath(null)
      return
    }

    // A simple closest-point matching for custom slicing of the curvedPath array
    const findClosestIndex = (targetLat, targetLng) => {
      let minDistance = Infinity
      let index = 0
      curvedPath.forEach((coord, i) => {
        const dist = Math.sqrt(Math.pow(coord.lat - targetLat, 2) + Math.pow(coord.lng - targetLng, 2))
        if (dist < minDistance) {
          minDistance = dist
          index = i
        }
      })
      return index
    }

    const startIdx = findClosestIndex(navMatch.fromStop.lat, navMatch.fromStop.lng)
    const endIdx = findClosestIndex(navMatch.toStop.lat, navMatch.toStop.lng)
    
    if (startIdx >= endIdx) {
      setNavPath(null)
    } else {
      setNavPath(curvedPath.slice(startIdx, endIdx + 1))
    }
  }, [curvedPath, navMatch])

  // Fly to fit bounds when selected or when navigation changes
  useEffect(() => {
    if (!map || (!isSelected && !navMatch)) return
    
    const coordsToFit = navPath || curvedPath
    if (coordsToFit && coordsToFit.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      coordsToFit.forEach(c => bounds.extend(new window.google.maps.LatLng(c.lat, c.lng)))
      
      // Basic padding 
      map.fitBounds(bounds, {
        top: 80, bottom: 80, left: 80, right: 80
      })
    }
  }, [isSelected, curvedPath, navPath, map, navMatch])

  // Render variables
  const lineOpacity = isSelected ? (navMatch ? 0.2 : 0.8) : 0.35
  const lineWeight = isSelected ? 5 : 3

  return (
    <>
      {/* Background/Base Curve Line */}
      {curvedPath && (
        <Polyline
          path={curvedPath}
          options={{
            strokeColor: route.color,
            strokeWeight: lineWeight,
            strokeOpacity: lineOpacity,
            clickable: false,
          }}
        />
      )}

      {/* Embedded Navigation Outline Highlight */}
      {navPath && (
        <Polyline
          path={navPath}
          options={{
            strokeColor: '#10b981', // Emerald green
            strokeWeight: 7,
            strokeOpacity: 1,
            clickable: false,
            zIndex: 100
          }}
        />
      )}

      {/* Render Stops using Custom HTML Markers */}
      {route.stops.map((stop, index) => {
        const isTerminal = index === 0 || index === route.stops.length - 1
        const isNavStop = navMatch && (stop.id === navMatch.fromStop.id || stop.id === navMatch.toStop.id)
        const isInNavRange = navMatch && 
          index >= route.stops.findIndex(s => s.id === navMatch.fromStop.id) &&
          index <= route.stops.findIndex(s => s.id === navMatch.toStop.id)

        // Clean UI conditions
        if (!isSelected && !isNavStop) return null
        if (navMatch && !isInNavRange) return null

        // Determine Stop style size based on importance
        const sizePx = isNavStop ? 20 : (isSelected ? (isTerminal ? 16 : 12) : 10)
        const bgColor = isNavStop ? '#10b981' : (isTerminal ? route.color : '#1e293b')
        const borderColor = isNavStop ? '#ffffff' : route.color
        const borderPx = isNavStop ? 3 : 2

        return (
          <CustomMarker key={`${route.id}-stop-${stop.id}`} lat={stop.lat} lng={stop.lng}>
            <div className="group relative">
              <div 
                style={{ 
                  width: `${sizePx}px`, 
                  height: `${sizePx}px`, 
                  backgroundColor: bgColor, 
                  borderColor: borderColor,
                  borderWidth: `${borderPx}px`
                }} 
                className="rounded-full shadow-lg transition-transform transform hover:scale-125 z-10 relative cursor-pointer"
              />

              {/* Minimal Pop-up Tooltip on hover/click */}
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl text-center min-w-[120px] transition-opacity z-50 pointer-events-none">
                <p className="font-bold text-sm text-white">{stop.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                  {isNavStop ? 'Navigation Point' : `Stop ${index + 1} of ${route.stops.length}`}
                </p>
                {navMatch && isInNavRange && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Part of selected trip</p>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </CustomMarker>
        )
      })}
    </>
  )
}

export default RouteLayer
