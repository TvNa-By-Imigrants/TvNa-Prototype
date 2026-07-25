import { useState } from 'react'
import MoodSelector from './MoodSelector.jsx'

export default function IntentForm({ onSubmit }) {
    const [budget, setBudget] = useState('')
    const [groupSize, setGroupSize] = useState('')
    const [duration, setDuration] = useState('')
    const [startTime, setStartTime] = useState('')
    const [category, setCategory] = useState('')
    const [tvrean, setTvrean] = useState('')
    const [area, setArea] = useState('')
    const [mood, setMood] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ budget, groupSize, duration, startTime, category, tvrean, area, mood })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg w-full">
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Budget (USD)</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-2.5 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/20"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Group Size</label>
                    <input
                        type="number"
                        value={groupSize}
                        onChange={e => setGroupSize(e.target.value)}
                        placeholder="2"
                        className="w-full px-4 py-2.5 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/20"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Duration (hours)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="4"
                        className="w-full px-4 py-2.5 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/20"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Start Time</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/20"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-1.5">Category</label>
                <div className="flex gap-2">
                    {['nhamey', 'derlg', 'both'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setCategory(opt)}
                            className={`flex-1 py-2 rounded-full text-sm font-medium border-2 cursor-pointer transition-all ${
                                category === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                    : 'border-(--muted) text-(--text) hover:border-(--indigo)'
                            }`}
                        >
                            {opt === 'nhamey' ? '🍜 NhamEy' : opt === 'derlg' ? '🎮 DerLg' : 'Both'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-1.5">Tvrean</label>
                <div className="flex gap-2">
                    {['none', 'cafe', 'library'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setTvrean(opt)}
                            className={`flex-1 py-2 rounded-full text-sm font-medium border-2 cursor-pointer transition-all ${
                                tvrean === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                    : 'border-(--muted) text-(--text) hover:border-(--indigo)'
                            }`}
                        >
                            {opt === 'none' ? 'None' : opt === 'cafe' ? '☕ Cafe' : '📚 Library'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-1.5">Area</label>
                <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="e.g. BKK1, Toul Kork, Chamkar Mon"
                    className="w-full px-4 py-2.5 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/20"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-1.5">Mood</label>
                <MoodSelector selected={mood} onSelect={setMood} />
            </div>

            <button
                type="submit"
                className="btn bg-(--indigo) text-white py-3 rounded-full font-bold text-lg cursor-pointer mt-2"
            >
                Generate My Plan ✨
            </button>
        </form>
    )
}
