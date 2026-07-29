import { useState } from 'react'
import { suggestPlaces } from '../../services/suggestionEngine.js'
import { Utensils, Gamepad2, Coffee, Search } from 'lucide-react'

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
        <div className="py-4 px-4 rounded-2xl bg-(--card-bg) border border-(--muted)/20 shadow-sm my-2 animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-semibold text-(--text)">Find a place</p>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--bg-input) transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-(--muted)">close</span>
                </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-3">
                <div className="flex gap-2">
                    {['nhamey', 'derlg', 'tvrean'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setCategory(opt)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all ${
                                category === opt
                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                    : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'
                            }`}
                        >
                            {opt === 'nhamey' ? <span className="flex items-center gap-1"><Utensils size={14} /> NhamEy</span> : opt === 'derlg' ? <span className="flex items-center gap-1"><Gamepad2 size={14} /> DerLg</span> : <span className="flex items-center gap-1"><Coffee size={14} /> Tvrean</span>}
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
                                className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all ${
                                    tvrean === opt
                                        ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                        : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'
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
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-(--muted)/30 bg-(--bg-input) text-(--text) text-sm focus:outline-none focus:border-(--indigo) transition-all"
                />

                <button
                    onClick={handleFind}
                    className="btn bg-(--indigo) text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 cursor-pointer"
                    disabled={!category}
                >
                    <span className="flex items-center gap-1.5"><Search size={16} /> Find Places</span>
                </button>
            </div>

            {searched && suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-(--muted)">Suggestions:</p>
                    {suggestions.map((place, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-(--bg) border border-(--muted)/15 hover:border-(--indigo)/30 transition-all">
                            <img src={place.image} alt={place.title} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-(--text) truncate">{place.title}</p>
                                <p className="text-xs text-(--muted)">{place.area}</p>
                            </div>
                            <button
                                onClick={() => onAdd(place)}
                                className="px-3.5 py-1.5 rounded-lg bg-(--indigo) text-white text-xs font-semibold cursor-pointer shrink-0 hover:scale-[1.03] active:scale-[0.97] transition-all"
                            >
                                Add
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {searched && suggestions.length === 0 && (
                <p className="text-xs text-(--muted) text-center py-2">No places found. Try different filters.</p>
            )}
        </div>
    )
}
