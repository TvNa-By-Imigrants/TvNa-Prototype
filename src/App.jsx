import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home.jsx'
import PlanRequest from './pages/PlanRequest.jsx'
import PlanResult from './pages/PlanResult.jsx'
import Map from './pages/Map.jsx'
import Community from './pages/Community.jsx'
import Profile from './pages/Profile.jsx'
import Favourited from './pages/Favourited.jsx'

function App() {
    return (
        <div className="min-h-screen bg-(--bg) text-(--text)">
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/plan" element={<PlanRequest />} />
                <Route path="/plan/result" element={<PlanResult />} />
                <Route path="/map" element={<Map />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile/:slug" element={<Profile />} />
                <Route path="/favourited" element={<Favourited />} />
            </Routes>
            <Footer />
        </div>
    )
}

export default App
