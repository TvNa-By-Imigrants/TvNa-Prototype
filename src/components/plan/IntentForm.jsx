import { useState } from 'react'
import MoodSelector from './MoodSelector.jsx'
import { Utensils, Gamepad2, Coffee, BookOpen, Sparkles } from 'lucide-react'

function getCategoryLabel(opt) {
    if (opt === 'nhamey') return <span className="flex items-center gap-1.5"><Utensils size={16} /> NhamEy</span>
    if (opt === 'derlg') return <span className="flex items-center gap-1.5"><Gamepad2 size={16} /> DerLg</span>
    return 'Both'
}

function getTvreanLabel(opt) {
    if (opt === 'cafe') return <span className="flex items-center gap-1.5"><Coffee size={16} /> Cafe</span>
    if (opt === 'library') return <span className="flex items-center gap-1.5"><BookOpen size={16} /> Library</span>
    return 'None'
}

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Budget (USD)</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        placeholder="15"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Group Size</label>
                    <input
                        type="number"
                        value={groupSize}
                        onChange={e => setGroupSize(e.target.value)}
                        placeholder="2"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Duration (hours)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        placeholder="4"
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-(--text) mb-1.5">Start Time</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 transition-all"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-2">Category</label>
                <div className="flex gap-2">
                    {['nhamey', 'derlg', 'both'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setCategory(opt)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
                                category === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10 shadow-sm'
                                    : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50 hover:bg-(--indigo)/5'
                            }`}
                        >
                            {getCategoryLabel(opt)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-2">Tvrean</label>
                <div className="flex gap-2">
                    {['none', 'cafe', 'library'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setTvrean(opt)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
                                tvrean === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10 shadow-sm'
                                    : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50 hover:bg-(--indigo)/5'
                            }`}
                        >
                            {getTvreanLabel(opt)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-2">Area</label>
                <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="e.g. BKK1, Toul Kork, Chamkar Mon"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)/10 transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-(--text) mb-2">Mood</label>
                <MoodSelector selected={mood} onSelect={setMood} />
            </div>

            <button
                type="submit"
                className="btn bg-(--indigo) text-white py-3.5 rounded-xl font-bold text-lg cursor-pointer mt-2"
            >
                <span className="flex items-center gap-2">Generate My Plan <Sparkles size={18} /></span>
            </button>
        </form>
    )
}
