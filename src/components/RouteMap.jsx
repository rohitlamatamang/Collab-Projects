import { useCallback, useState } from 'react'
import { GoogleMap } from '@react-google-maps/api'
import RouteLayer from './RouteLayer'
import Legend from './Legend'

const KATHMANDU_CENTER = { lat: 27.7000, lng: 85.3340 }
const DEFAULT_ZOOM = 13

// Default Light Mode style for Google Maps
const CARTO_DARK_MATTER_STYLE = []

function RouteMap({ routes, selectedRouteId, visibleRouteIds, navMatch }) {
  const visibleRoutes = routes.filter(r => visibleRouteIds.has(r.id))
  const [map, setMap] = useState(null)

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null)
  }, [])

  return (
    <div className="h-full w-full p-3 md:p-4">
      <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl shadow-black/30 bg-slate-900 flex items-center justify-center">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={KATHMANDU_CENTER}
          zoom={DEFAULT_ZOOM}
          options={{
            styles: CARTO_DARK_MATTER_STYLE,
            disableDefaultUI: true, // remove clutter like streetview, Map/Satellite toggle
            zoomControl: true, // add generic zoom control back in
          }}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {visibleRoutes.map((route) => (
            <RouteLayer
              key={route.id}
              route={route}
              isSelected={selectedRouteId === route.id}
              navMatch={navMatch?.routeId === route.id ? navMatch : null}
              map={map}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Legend overlay */}
      <Legend routes={routes} visibleRouteIds={visibleRouteIds} />
    </div>
  )
}

export default RouteMap
