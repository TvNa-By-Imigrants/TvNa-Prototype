const moods = [
    { id: 'study', label: 'Study', icon: 'menu_book' },
    { id: 'chill', label: 'Chill', icon: 'self_improvement' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'date', label: 'Date', icon: 'favorite' },
    { id: 'group', label: 'Group', icon: 'group' }
]

export default function MoodSelector({ selected, onSelect }) {
    return (
        <div className="flex flex-wrap gap-3">
            {moods.map(mood => (
                <button
                    key={mood.id}
                    onClick={() => onSelect(mood.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium transition-all cursor-pointer ${
                        selected === mood.id
                            ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                            : 'border-(--muted) text-(--text) hover:border-(--indigo)'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{mood.icon}</span>
                    {mood.label}
                </button>
            ))}
        </div>
    )
}
