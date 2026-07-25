import { useState } from 'react'
import { suggestPlaces } from '../../services/suggestionEngine.js'

export default function JuyRoForm({ onAdd, onClose, currentStops }) {
    const [category, setCategory] = useState('')
    const [tvrean, setTvrean] = useState('')
    const [area, setArea] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [searched, setSearched] = useState(false)

    const handleFind = () => {
        if (!category) return
        const results = suggestPlaces({ category, tvrean, area })
        const usedTitles = new Set(currentStops.map(s => s.place))
        setSuggestions(results.filter(p => !usedTitles.has(p.title)))
        setSearched(true)
    }

    return (
        <div className="py-3 px-3 rounded-xl bg-(--card-bg)/80 border border-(--muted)/30 my-2">
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-(--text)">Find a place</p>
                <button onClick={onClose} className="text-(--muted) hover:text-(--text) cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>

            <div className="flex flex-col gap-2 mb-3">
                <div className="flex gap-2">
                    {['nhamey', 'derlg', 'tvrean'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setCategory(opt)}
                            className={`flex-1 py-1.5 rounded-full text-xs font-medium border-2 cursor-pointer transition-all ${
                                category === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                    : 'border-(--muted) text-(--text) hover:border-(--indigo)'
                            }`}
                        >
                            {opt === 'nhamey' ? '🍜 NhamEy' : opt === 'derlg' ? '🎮 DerLg' : '☕ Tvrean'}
                        </button>
                    ))}
                </div>

                {category === 'tvrean' && (
                    <div className="flex gap-2">
                        {['none', 'cafe', 'library'].map(opt => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => setTvrean(opt)}
                                className={`flex-1 py-1.5 rounded-full text-xs font-medium border-2 cursor-pointer transition-all ${
                                    tvrean === opt
                                        ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                        : 'border-(--muted) text-(--text) hover:border-(--indigo)'
                                }`}
                            >
                                {opt === 'none' ? 'Any' : opt === 'cafe' ? 'Cafe' : 'Library'}
                            </button>
                        ))}
                    </div>
                )}

                <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="Area (e.g. BKK1, Toul Kork)"
                    className="w-full px-3 py-1.5 rounded-lg border border-(--muted) bg-(--bg-input) text-(--text) text-xs focus:outline-none focus:border-(--indigo)"
                />

                <button
                    onClick={handleFind}
                    className="btn bg-(--indigo) text-white py-2 rounded-full text-xs font-bold disabled:opacity-50 cursor-pointer"
                    disabled={!category}
                >
                    🔍 Find Places
                </button>
            </div>

            {searched && suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-(--muted)">Suggestions:</p>
                    {suggestions.map((place, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-(--bg) border border-(--muted)/20">
                            <img src={place.image} alt={place.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-(--text) truncate">{place.title}</p>
                                <p className="text-xs text-(--muted)">{place.area}</p>
                            </div>
                            <button
                                onClick={() => onAdd(place)}
                                className="px-3 py-1 rounded-full bg-(--indigo) text-white text-xs font-medium cursor-pointer shrink-0"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {searched && suggestions.length === 0 && (
                <p className="text-xs text-(--muted)">No places found. Try different filters.</p>
            )}
        </div>
    )
}
