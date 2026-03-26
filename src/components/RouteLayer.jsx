import { useEffect } from 'react'
import { Polyline, CircleMarker, Popup, useMap } from 'react-leaflet'

function RouteLayer({ route, isSelected, navMatch }) {
  const map = useMap()

  // Calculate the segment for A-to-B navigation
  const navSegment = (() => {
    if (!navMatch || !route.pathCoordinates || route.pathCoordinates.length < 2) return null
    
    // Find closest index in path for a given point
    const findClosestIndex = (target) => {
      let minDistance = Infinity
      let index = 0
      route.pathCoordinates.forEach((coord, i) => {
        const dist = Math.sqrt(Math.pow(coord[0] - target.lat, 2) + Math.pow(coord[1] - target.lng, 2))
        if (dist < minDistance) {
          minDistance = dist
          index = i
        }
      })
      return index
    }

    const startIdx = findClosestIndex(navMatch.fromStop)
    const endIdx = findClosestIndex(navMatch.toStop)
    
    if (startIdx >= endIdx) return null
    return route.pathCoordinates.slice(startIdx, endIdx + 1)
  })()

  // Fly to fit bounds when selected or when navigation changes
  useEffect(() => {
    const coordsToFit = navSegment || route.pathCoordinates
    if (isSelected && coordsToFit.length > 0) {
      const bounds = coordsToFit.map(c => [c[0], c[1]])
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, duration: 0.8 })
    }
  }, [isSelected, route.pathCoordinates, navSegment, map])

  return (
    <>
      {/* Route path - main background line */}
      <Polyline
        positions={route.pathCoordinates}
        pathOptions={{
          color: route.color,
          weight: isSelected ? 4 : 2.5,
          opacity: isSelected ? (navSegment ? 0.15 : 0.8) : 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Navigation highlight (if searching) */}
      {navSegment && (
        <Polyline
          positions={navSegment}
          pathOptions={{
            color: '#10b981', // Emerald green for nav
            weight: 6,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* Stop markers */}
      {route.stops.map((stop, index) => {
        const isTerminal = index === 0 || index === route.stops.length - 1
        const isNavStop = navMatch && (stop.id === navMatch.fromStop.id || stop.id === navMatch.toStop.id)
        const isInNavRange = navMatch && 
          index >= route.stops.findIndex(s => s.id === navMatch.fromStop.id) &&
          index <= route.stops.findIndex(s => s.id === navMatch.toStop.id)

        if (!isSelected && !isNavStop) return null // Hide non-selected stops on map noise
        if (navMatch && !isInNavRange) return null // Hide stops outside search range if searching

        return (
          <CircleMarker
            key={`${route.id}-stop-${stop.id}`}
            center={[stop.lat, stop.lng]}
            radius={isNavStop ? 8 : (isSelected ? (isTerminal ? 6 : 4) : 4)}
            pathOptions={{
              fillColor: isNavStop ? '#10b981' : (isTerminal ? route.color : '#1e293b'),
              fillOpacity: 1,
              color: isNavStop ? '#ffffff' : route.color,
              weight: isNavStop ? 2.5 : 1.5,
              opacity: 1,
            }}
          >
            <Popup>
              <div className="text-center min-w-[120px]">
                <p className="font-bold text-sm">{stop.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                  {isNavStop ? 'Navigation Point' : `Stop ${index + 1} of ${route.stops.length}`}
                </p>
                {navMatch && isInNavRange && (
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5">Part of selected trip</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}

export default RouteLayer
