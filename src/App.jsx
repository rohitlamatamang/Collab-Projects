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
        
        {/* Main Content Area - padded top to account for fixed navbar */}
        <main className="flex-1 pt-14 relative h-full w-full">
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
