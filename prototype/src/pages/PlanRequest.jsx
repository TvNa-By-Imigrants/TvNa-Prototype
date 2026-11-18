import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IntentForm from '../components/plan/IntentForm.jsx'
import TvNaAIModal from '../components/plan/TvNaAIModal.jsx'
import { generatePlanFromForm } from '../services/gemini.js'
import { Sparkles, Wand2, MessageSquareText } from 'lucide-react'

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
        <main className="px-6 py-10 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-3 flex items-center justify-center gap-3">TvNaAI <Sparkles className="text-(--indigo) animate-pulse" size={36} /></h1>
                </div>

                {error && (
                    <div className="text-red-500 text-sm bg-red-500/10 px-4 py-3 rounded-xl max-w-lg mx-auto mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Form Card */}
                    <div className="bg-(--card-bg) rounded-2xl shadow-sm p-8 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-(--indigo)/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-(--indigo)">edit_note</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-(--text)">Quick Form</h2>
                                <p className="text-xs text-(--muted)">Fill in your preferences</p>
                            </div>
                        </div>
                        <IntentForm onSubmit={handleFormSubmit} />
                    </div>

                    {/* TvNaAI Card */}
                    <div className="bg-(--card-bg) rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center text-center animate-fadeIn" style={{ animationDelay: '100ms' }}>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-(--indigo) to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-(--indigo)/20">
                            <Wand2 className="text-white" size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-(--text) mb-2">Or Describe Freely</h2>
                        <p className="text-(--muted) text-sm mb-6 max-w-xs">Tell TvNaAI what you want in your own words — it'll understand and plan everything for you</p>
                        <button
                            onClick={() => setShowTvNaAI(true)}
                            className="btn bg-(--indigo) text-white px-8 py-3 text-base font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.03] transition-all"
                        >
                            <MessageSquareText size={20} className="mr-2" />
                            Open TvNaAI
                        </button>
                        <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                            <p className="text-xs text-(--muted) font-medium">Try saying:</p>
                            <p className="text-xs text-(--muted)/70 bg-(--bg-input) px-3 py-2 rounded-lg">"Budget $10, cafe at 2PM, eat at 5PM"</p>
                            <p className="text-xs text-(--muted)/70 bg-(--bg-input) px-3 py-2 rounded-lg">"Date night in Chamkar Mon"</p>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-3 border-(--muted)/30 border-t-(--indigo) animate-spin"></div>
                            <span className="text-sm text-(--muted)">Generating your plan...</span>
                        </div>
                    </div>
                )}
            </div>

            <TvNaAIModal
                isOpen={showTvNaAI}
                onClose={() => setShowTvNaAI(false)}
                onGenerated={handleTvNaAI}
            />
        </main>
    )
}
