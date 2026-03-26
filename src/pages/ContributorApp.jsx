import { useState } from 'react'
import ContributionMap from '../components/ContributionMap'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectOption } from '../components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { MapPin, Play, Sparkles, Check } from 'lucide-react'

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

  const handleDemoFill = () => {
    setSubmitterName(DEMO_ROUTE.submitterName)
    setRouteName(DEMO_ROUTE.routeName)
    setVehicleType(DEMO_ROUTE.vehicleType)
    setColor(DEMO_ROUTE.color)
    setInitialData({
      coords: DEMO_ROUTE.pathCoordinates,
      stops: DEMO_ROUTE.stops
    })
  }

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

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-lg mx-auto mt-2 md:mt-10 relative z-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MapPin className="w-8 h-8 text-white" />
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
          <Button
            variant="outline"
            onClick={handleDemoFill}
            className="w-full py-6"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Autofill Demo
          </Button>
          <Button
            variant="success"
            onClick={handleAutoDemo}
            className="w-full py-6"
          >
            <Play className="w-4 h-4 mr-2" />
            Instant Demo
          </Button>
        </div>

        {/* Form Card */}
        <Card className="rounded-[2rem] p-2">
          <CardContent className="p-6 space-y-6">

            {/* Submitter Name */}
            <div className="space-y-2">
              <Label htmlFor="submitter">Your Alias</Label>
              <Input
                id="submitter"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="e.g. Hari Bahadur"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Route Name */}
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Path</Label>
              <Input
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g. Gongabu to Lagankhel"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vehicle Type */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select
                  id="vehicle"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="h-12 rounded-xl"
                >
                  <SelectOption value="Bus">City Bus</SelectOption>
                  <SelectOption value="Microbus">Microbus</SelectOption>
                  <SelectOption value="Tempo">Safa Tempo</SelectOption>
                </Select>
              </div>

              {/* Route Color Picker */}
              <div className="col-span-2 md:col-span-1 space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-lg ${color === c ? 'ring-[3px] ring-white scale-110' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Mapping Button */}
            <div className="pt-4">
              <Button
                onClick={handleStartMapping}
                className="w-full h-12"
                size="lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Open Map Editor
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ContributorApp
