import { useState } from 'react'
import { places } from '../services/mockData.js'
import { goNowLink } from '../services/mapLinks.js'

export default function Map() {
    const [search, setSearch] = useState('')
    const embedUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL

    const filtered = places.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold">Map</h1>

                <div className="relative w-full max-w-[500px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)">search</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search places..."
                        className="search-input"
                    />
                    {search && (
                        <div className="search-dropdown">
                            {filtered.map((place, i) => (
                                <div key={i} className="search-dropdown-item" onClick={() => setSearch(place.name)}>
                                    <div className="font-medium text-(--text)">{place.name}</div>
                                    <div className="text-xs text-(--muted)">{place.desc}</div>
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
                    <div className="map-container w-full flex items-center justify-center bg-(--card-bg)">
                        <p className="text-(--muted)">Add VITE_GOOGLE_MAPS_EMBED_URL to .env</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {places.map((place, i) => (
                        <div key={i} className="bg-(--card-bg) rounded-xl p-4 shadow-md">
                            <h3 className="font-semibold text-(--text) mb-1">{place.name}</h3>
                            <p className="text-sm text-(--muted) mb-3">{place.desc}</p>
                            <a
                                href={goNowLink(place.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn bg-(--indigo) text-sm py-2 px-4 rounded-full inline-flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">navigation</span>
                                Go Now
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
