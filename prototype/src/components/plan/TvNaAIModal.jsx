import { useState } from 'react'
import { generatePlan } from '../../services/gemini.js'
import { Sparkles } from 'lucide-react'

const examples = [
    "Budget $10, study at a cafe in the morning, then eat cheap in BKK1",
    "Date night for 2: dinner at 6PM in Chamkar Mon, then walk by the river",
    "Group of 5, budget $40, arcade at 2PM, eat at 5PM, park after",
    "I want to eat Khmer food at 12PM, then chill at a park, budget $8"
]

export default function TvNaAIModal({ isOpen, onClose, onGenerated }) {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!text.trim()) return

        setLoading(true)
        setError('')

        try {
            const plan = await generatePlan(text)
            onGenerated(plan)
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to generate plan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-(--bg) rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-(--indigo) to-purple-600 flex items-center justify-center shadow-md">
                            <span className="material-symbols-outlined text-white">auto_awesome</span>
                        </div>
                        <h2 className="text-xl font-bold text-(--text)">TvNaAI</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-(--bg-input) transition-colors">
                        <span className="material-symbols-outlined text-(--muted)">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Describe your perfect day... e.g. I want to eat at 2PM, cafe at 4PM, hangout at 7PM in BKK1"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 resize-none transition-all"
                    />

                    <div>
                        <p className="text-xs text-(--muted) font-medium mb-2">Try these:</p>
                        <div className="flex flex-col gap-1.5">
                            {examples.map((ex, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setText(ex)}
                                    className="text-left text-xs px-3 py-2 rounded-lg bg-(--card-bg) border border-(--muted)/20 text-(--text) hover:border-(--indigo)/50 hover:text-(--indigo) cursor-pointer transition-all"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-500/10 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn bg-(--indigo) text-white py-3 rounded-xl font-bold text-base disabled:opacity-50 cursor-pointer"
                        disabled={!text.trim() || loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Planning...
                            </span>
                        ) : (
                            (<span className="flex items-center gap-2">Plan My Day <Sparkles size={18} /></span>)
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
