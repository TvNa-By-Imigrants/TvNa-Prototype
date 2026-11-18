const moods = [
    { id: 'study', label: 'Study', icon: 'menu_book' },
    { id: 'chill', label: 'Chill', icon: 'self_improvement' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
    { id: 'date', label: 'Date', icon: 'favorite' },
    { id: 'group', label: 'Group', icon: 'group' }
]

export default function MoodSelector({ selected, onSelect }) {
    return (
        <div className="flex flex-wrap gap-2">
            {moods.map(mood => (
                <button
                    key={mood.id}
                    onClick={() => onSelect(mood.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                        selected === mood.id
                            ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10 shadow-sm'
                            : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50 hover:bg-(--indigo)/5'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">{mood.icon}</span>
                    {mood.label}
                </button>
            ))}
        </div>
    )
}
