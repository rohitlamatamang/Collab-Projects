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
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-4 md:p-8 no-scrollbar md:custom-scrollbar relative">
      
      {/* Premium Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-lg mx-auto mt-2 md:mt-10 relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Map a New Route
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Help build Kathmandu's transit network. Trace your daily commute and submit it for the community.
          </p>
        </div>

        {/* Demo Buttons */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            onClick={handleDemoFill}
            className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-slate-300 font-semibold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98]"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
            <span className="text-sm">Autofill Demo</span>
          </button>
          <button 
            onClick={handleAutoDemo}
            className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/20 text-emerald-400 font-semibold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98]"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🚀</span>
            <span className="text-sm">Instant Demo</span>
          </button>
        </div>

        {/* Start Submission Form */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-black/40">
          
          <div className="space-y-6">
            {/* Submitter Name */}
            <div>
              <label htmlFor="submitter" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Your Alias
              </label>
              <input
                type="text"
                id="submitter"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="e.g. Hari Bahadur"
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20"
              />
            </div>

            {/* Route Name */}
            <div>
              <label htmlFor="routeName" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                Route Path
              </label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Gongabu to Lagankhel"
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner shadow-black/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vehicle Type */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="vehicle" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Vehicle
                </label>
                <div className="relative">
                  <select
                    id="vehicle"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full appearance-none bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-inner shadow-black/20"
                  >
                    <option value="Bus">City Bus</option>
                    <option value="Microbus">Microbus</option>
                    <option value="Tempo">Safa Tempo</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Route Color Picker */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
                  Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-lg ${color === c ? 'ring-[3px] ring-white scale-110 shadow-black/50' : 'hover:scale-110 opacity-60 hover:opacity-100 shadow-black/20'}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Mapping Button */}
            <div className="pt-6">
              <button 
                onClick={handleStartMapping}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                Open Map Editor
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ContributorApp
