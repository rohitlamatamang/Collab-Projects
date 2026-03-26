import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import CommuterApp from './pages/CommuterApp'
import ContributorApp from './pages/ContributorApp'
import AdminDashboard from './pages/AdminDashboard'

function App() {
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
