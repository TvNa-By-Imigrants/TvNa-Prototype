export default function AddStopPicker({ suggestedPlaces, currentStops, onAdd, onCancel }) {
    const usedTitles = new Set(currentStops.map(s => s.place))
    const available = suggestedPlaces.filter(p => !usedTitles.has(p.title))

    if (available.length === 0) {
        return (
            <div className="flex items-center justify-center gap-3 py-4 px-3 rounded-xl bg-(--card-bg)/50 border border-dashed border-(--muted) my-2">
                <p className="text-sm text-(--muted)">No more suggestions available</p>
                <button onClick={onCancel} className="text-sm text-(--indigo) hover:underline cursor-pointer">Close</button>
            </div>
        )
    }

    return (
        <div className="py-3 px-3 rounded-xl bg-(--card-bg)/50 border border-dashed border-(--muted) my-2">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {available.map((place, i) => (
                    <div key={i} className="shrink-0 w-36 rounded-lg overflow-hidden bg-(--card-bg) border border-(--muted)/30 shadow-sm">
                        <img src={place.image} alt={place.title} className="w-full h-20 object-cover" />
                        <div className="p-2">
                            <p className="text-xs font-semibold text-(--text) truncate">{place.title}</p>
                            <button
                                onClick={() => onAdd(place)}
                                className="mt-1 w-full text-xs py-1 rounded-full bg-(--indigo) text-white font-medium hover:bg-(--hover-btn) cursor-pointer"
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-1">
                <button onClick={onCancel} className="text-xs text-(--muted) hover:text-(--text) cursor-pointer">Cancel</button>
            </div>
        </div>
    )
}
