import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IntentForm from '../components/plan/IntentForm.jsx'
import TvNaAIModal from '../components/plan/TvNaAIModal.jsx'
import { generatePlanFromForm } from '../services/gemini.js'

export default function PlanRequest() {
    const navigate = useNavigate()
    const [showTvNaAI, setShowTvNaAI] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleFormSubmit = async (formData) => {
        setLoading(true)
        setError('')
        try {
            const plan = await generatePlanFromForm(formData)
            navigate('/plan/result', { state: { plan } })
        } catch (err) {
            setError(err.message || 'Failed to generate plan')
        } finally {
            setLoading(false)
        }
    }

    const handleTvNaAI = (plan) => {
        navigate('/plan/result', { state: { plan } })
    }

    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3">Juy Reab Jom</h1>
                    <p className="text-(--muted) text-lg">Fill in your preferences and AI will plan your perfect day</p>
                </div>

                <div className="flex justify-center mb-8">
                    <IntentForm onSubmit={handleFormSubmit} />
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-500/10 px-4 py-3 rounded-xl max-w-lg mx-auto mb-6">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="w-8 h-8 rounded-full border-4 border-(--muted)/30 border-t-(--indigo) animate-spin"></div>
                    </div>
                )}

                <div className="flex items-center gap-4 max-w-lg mx-auto my-8">
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                    <span className="text-sm text-(--muted)">or</span>
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => setShowTvNaAI(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-(--indigo) text-(--indigo) font-bold hover:bg-(--indigo)/10 cursor-pointer transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                        Try TvNaAI — type freely
                    </button>
                </div>
            </div>

            <TvNaAIModal
                isOpen={showTvNaAI}
                onClose={() => setShowTvNaAI(false)}
                onGenerated={handleTvNaAI}
            />
        </main>
    )
}
