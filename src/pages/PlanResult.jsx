import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AIThinkingState from '../components/plan/AIThinkingState.jsx'
import ItineraryTimeline from '../components/plan/ItineraryTimeline.jsx'

export default function PlanResult() {
    const location = useLocation()
    const plan = location.state?.plan
    const [loading, setLoading] = useState(true)
    const [stops, setStops] = useState(plan?.stops || [])

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1800)
        return () => clearTimeout(timer)
    }, [])

    if (!plan) {
        return (
            <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
                <div className="max-w-(--max-width) mx-auto text-center py-20">
                    <p className="text-(--muted)">No plan generated yet.</p>
                </div>
            </main>
        )
    }

    const handleStopsChange = (newStops) => {
        setStops(newStops)
    }

    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto">
                {loading ? (
                    <AIThinkingState />
                ) : (
                    <ItineraryTimeline plan={{ ...plan, stops }} onStopsChange={handleStopsChange} />
                )}
            </div>
        </main>
    )
}
