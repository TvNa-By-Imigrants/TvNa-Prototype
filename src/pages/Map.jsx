import { useState } from 'react'
import { businessPartners } from '../services/mockData.js'
import { goNowLink } from '../services/mapLinks.js'
import { Search, MapPin, Clock, Phone, Navigation } from 'lucide-react'

export default function Map() {
    const [search, setSearch] = useState('')
    const embedUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL

    const filtered = businessPartners.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    const categoryColor = (cat) => {
        if (cat === 'cafe') return 'bg-amber-500/10 text-amber-600'
        if (cat === 'restaurant') return 'bg-blue-500/10 text-blue-600'
        return 'bg-purple-500/10 text-purple-600'
    }

    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold">Featured Partners</h1>

                <div className="relative w-full max-w-[500px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search partners..."
                        className="search-input"
                    />
                    {search && (
                        <div className="search-dropdown">
                            {filtered.map((partner) => (
                                <div key={partner.id} className="search-dropdown-item" onClick={() => setSearch(partner.name)}>
                                    <div className="font-medium text-(--text)">{partner.name}</div>
                                    <div className="text-xs text-(--muted)">{partner.category} · {partner.address}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {embedUrl ? (
                    <div className="map-container w-full">
                        <iframe
                            src={embedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                ) : (
                    <div className="map-container w-full flex flex-col items-center justify-center bg-(--card-bg) gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-(--indigo)/10 flex items-center justify-center">
                            <MapPin className="text-(--indigo)" size={28} />
                        </div>
                        <p className="text-(--muted)">Add VITE_GOOGLE_MAPS_EMBED_URL to .env</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                    {filtered.map((partner) => (
                        <div key={partner.id} className="bg-(--card-bg) rounded-2xl overflow-hidden shadow-sm border border-(--muted)/10 hover:shadow-md hover:-translate-y-0.5 transition-all">
                            <img src={partner.image} alt={partner.name} className="w-full h-40 object-cover" />
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-(--text) text-lg">{partner.name}</h3>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryColor(partner.category)}`}>
                                        {partner.category}
                                    </span>
                                </div>
                                <p className="text-sm text-(--muted) mb-3 leading-relaxed">{partner.description}</p>
                                <div className="flex flex-col gap-1.5 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-(--muted)">
                                        <MapPin size={14} className="shrink-0" />
                                        <span>{partner.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-(--muted)">
                                        <Clock size={14} className="shrink-0" />
                                        <span>{partner.hours} · ${partner.priceRange.min}-${partner.priceRange.max}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-(--muted)">
                                        <Phone size={14} className="shrink-0" />
                                        <span>{partner.phone}</span>
                                    </div>
                                </div>
                                <a
                                    href={goNowLink(partner.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn bg-(--indigo) text-sm py-2.5 px-4 rounded-xl inline-flex items-center gap-1.5 w-full justify-center"
                                >
                                    <Navigation size={16} />
                                    Go Now
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="text-(--muted) text-sm py-8">No partners found matching "{search}"</p>
                )}
            </div>
        </main>
    )
}
