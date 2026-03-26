import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import RouteLayer from './RouteLayer'
import Legend from './Legend'
import 'leaflet/dist/leaflet.css'

const KATHMANDU_CENTER = [27.7000, 85.3340]
const DEFAULT_ZOOM = 13

function RouteMap({ routes, selectedRouteId, visibleRouteIds, navMatch }) {
  const visibleRoutes = routes.filter(r => visibleRouteIds.has(r.id))

  return (
    <div className="h-full w-full p-3 md:p-4">
      <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl shadow-black/30">
        <MapContainer
          center={KATHMANDU_CENTER}
          zoom={DEFAULT_ZOOM}
          zoomControl={false}
          className="h-full w-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />

          {visibleRoutes.map(route => (
            <RouteLayer
              key={route.id}
              route={route}
              isSelected={selectedRouteId === route.id}
              navMatch={navMatch?.routeId === route.id ? navMatch : null}
            />
          ))}
        </MapContainer>
      </div>

      {/* Legend overlay */}
      <Legend routes={routes} visibleRouteIds={visibleRouteIds} />
    </div>
  )
}

export default RouteMap
