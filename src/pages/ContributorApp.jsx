import { useState } from 'react'
import ContributionMap from '../components/ContributionMap'

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#eab308', // Yellow
]

const DEMO_ROUTE = {
  submitterName: 'Kathmandu Transit Mapper Demo',
  routeName: 'Chandeshwari to Ratnapark (Verified)',
  vehicleType: 'Microbus',
  color: '#8b5cf6',
  pathCoordinates: [[27.76885512224152,85.33038139343262],[27.746400845684775,85.32406210899354],[27.735084758674788,85.31806468963624],[27.734913725673746,85.31452417373659],[27.719177541328634,85.3125286102295],[27.716811215711164,85.31606912612915],[27.706998383717885,85.31421303749086],[27.706513664675914,85.31541466712952]],
  stops: [
    { name: 'Greenland (Chandeshwari)', lat: 27.746400845684775, lng: 85.32406210899354, fare: 15, order: 1 },
    { name: 'Samakhusi Chowk', lat: 27.735084758674788, lng: 85.31806468963624, fare: 20, order: 2 },
    { name: 'Thamel', lat: 27.719177541328634, lng: 85.3125286102295, fare: 30, order: 3 },
    { name: 'Ratnapark', lat: 27.706513664675914, lng: 85.31541466712952, fare: 35, order: 4 }
  ]
}

function ContributorApp() {
  const [isMapping, setIsMapping] = useState(false)
  const [submitterName, setSubmitterName] = useState('')
  const [routeName, setRouteName] = useState('')
  const [vehicleType, setVehicleType] = useState('Bus')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [initialData, setInitialData] = useState(null)

  // If mapping mode is active, render the map interface instead of the form
  if (isMapping) {
    return (
      <ContributionMap 
        routeData={{ submitterName, routeName, vehicleType, color }}
        prefillData={initialData}
        onCancel={() => {
          setIsMapping(false)
          setInitialData(null)
        }}
      />
    )
  }

  const handleStartMapping = () => {
    if(!submitterName || !routeName) {
      alert("Please fill in your name and route description first.")
      return
    }
    setIsMapping(true)
  }

  // Demo button that only fills the form fields; user must click "Start Mapping" manually
  const handleDemoFill = () => {
    setSubmitterName(DEMO_ROUTE.submitterName)
    setRouteName(DEMO_ROUTE.routeName)
    setVehicleType(DEMO_ROUTE.vehicleType)
    setColor(DEMO_ROUTE.color)
    setInitialData({
      coords: DEMO_ROUTE.pathCoordinates,
      stops: DEMO_ROUTE.stops
    })
    // Do NOT start mapping automatically
  }

  // Demo button that fills the form AND starts mapping immediately (full auto demo)
  const handleAutoDemo = () => {
    setSubmitterName(DEMO_ROUTE.submitterName)
    setRouteName(DEMO_ROUTE.routeName)
    setVehicleType(DEMO_ROUTE.vehicleType)
    setColor(DEMO_ROUTE.color)
    setInitialData({
      coords: DEMO_ROUTE.pathCoordinates,
      stops: DEMO_ROUTE.stops
    })
    setIsMapping(true)
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 md:p-8 custom-scrollbar">
      <div className="max-w-xl mx-auto mt-4 md:mt-10">
        
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Contribute a Route
          </h1>
          <p className="text-sm text-slate-400">
            Help map Kathmandu's unmatched public transport network. Record your route and submit it for review.
          </p>
        </div>

        {/* Demo Buttons */}
        <div className="mb-6 flex flex-col gap-3">
          <button 
            onClick={handleDemoFill}
            className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">✨</span>
            Fill Demo Form (then click Start Mapping)
          </button>
          <button 
            onClick={handleAutoDemo}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">🚀</span>
            Auto Demo: Chandeshwari → Ratnapark
          </button>
        </div>

        {/* Start Submission Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl shadow-black/20">
          
          <div className="space-y-6">
            {/* Submitter Name */}
            <div>
              <label htmlFor="submitter" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Your Name / Alias
              </label>
              <input
                type="text"
                id="submitter"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="e.g. Hari Bahadur"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Route Name */}
            <div>
              <label htmlFor="routeName" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Route Description
              </label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Gongabu to Lagankhel"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicle" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Vehicle Type
              </label>
              <div className="relative">
                <select
                  id="vehicle"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Bus">Bus (Mahanagar/Sajha etc)</option>
                  <option value="Microbus">Microbus (Hiace)</option>
                  <option value="Tempo">Safa Tempo</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Route Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Route Path Color
              </label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full transition-all flex items-center justify-center ${color === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Mapping Button */}
            <div className="pt-4">
              <button 
                onClick={handleStartMapping}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
              >
                Start Mapping
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default ContributorApp
