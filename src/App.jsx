import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useJsApiLoader } from '@react-google-maps/api'
import Navigation from './components/Navigation'
import CommuterApp from './pages/CommuterApp'
import ContributorApp from './pages/ContributorApp'
import AdminDashboard from './pages/AdminDashboard'

const LIBRARIES = ['places', 'geometry']

function App() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  })

  // Simple loading state
  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></div>
        {loadError ? <p className="text-red-400 text-sm">{loadError.message || "Failed to load Google Maps"}</p> : <p className="text-sm font-medium uppercase tracking-widest">Loading Maps Environment...</p>}
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
        <Navigation />
        
        {/* Main Content Area - padded bottom on mobile, padded top on desktop */}
        <main className="flex-1 pb-[68px] md:pb-0 md:pt-[68px] relative h-full w-full">
          <Routes>
            <Route path="/" element={<CommuterApp />} />
            <Route path="/contribute" element={<ContributorApp />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
