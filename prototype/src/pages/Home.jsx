import { useState, useRef } from 'react'
import PlaceCard from '../components/cards/PlaceCard.jsx'
import { derlgData, nhameyData, businessPartners } from '../services/mockData.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { Star } from 'lucide-react'

function getTabs(t) {
    return [
        { id: 'tvna', label: t('home.tabTvna'), icon: 'not_listed_location' },
        { id: 'derlg', label: t('home.tabDerlg'), icon: 'footprint' },
        { id: 'nhamey', label: t('home.tabNhamey'), icon: 'yoshoku' }
    ]
}

function ScrollCarousel({ title, data, icon }) {
    const scrollRef = useRef(null)

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' })
        }
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                {icon && <span className="text-(--indigo)">{icon}</span>}
                <h2 className="text-2xl font-bold text-(--text)">{title}</h2>
            </div>
            <div className="relative slider group">
                <button onClick={() => scroll(-1)} className="absolute z-10 left-2 top-1/2 -translate-y-1/2 flex p-2 rounded-full text-(--text) bg-(--bg)/90 shadow-md hover:bg-(--bg) hover:shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div ref={scrollRef} className="flex px-2 pb-6 overflow-x-auto gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                    {data.map((place, i) => <PlaceCard key={i} place={{ ...place, title: place.title || place.name }} />)}
                </div>
                <button onClick={() => scroll(1)} className="absolute z-10 right-2 top-1/2 -translate-y-1/2 flex p-2 rounded-full text-(--text) bg-(--bg)/90 shadow-md hover:bg-(--bg) hover:shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}

export default function Home() {
    const { t } = useLanguage()
    const tabs = getTabs(t)
    const [activeTab, setActiveTab] = useState('tvna')

    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto flex flex-col items-center gap-6">
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">TvNa?</h1>

                <nav className="flex gap-8 border-b-2 border-(--muted)/20 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-3 font-semibold transition-all cursor-pointer border-b-2 -mb-[2px] ${
                                activeTab === tab.id
                                    ? 'text-(--indigo) border-(--indigo)'
                                    : 'text-(--muted) border-transparent hover:text-(--text)'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {activeTab === 'tvna' && (
                    <div className="w-full mb-6 overflow-hidden rounded-2xl relative shadow-lg">
                        <div className="animated-slide flex w-[300%]">
                            <img src="/assets/visitPhnomPenh.webp" alt="visitPhnomPenh" className="w-1/3 shrink-0 h-[300px] object-cover" />
                            <img src="/assets/museum.webp" alt="museum" className="w-1/3 shrink-0 h-[300px] object-cover" />
                            <img src="/assets/funmall.webp" alt="funmall" className="w-1/3 shrink-0 h-[300px] object-cover" />
                        </div>
                    </div>
                )}

                <div className="w-full">
                    {activeTab === 'tvna' && (
                        <div className="flex flex-col gap-10">
                            <ScrollCarousel title="Featured Partners" data={businessPartners} icon={<Star size={20} />} />
                            <ScrollCarousel title="DerLg" data={derlgData} />
                            <ScrollCarousel title="NhamEy" data={nhameyData} />
                        </div>
                    )}

                    {activeTab === 'derlg' && (
                        <div className="flex justify-center items-center mb-10">
                            <div className="card-grid">
                                {derlgData.map((place, i) => <PlaceCard key={i} place={place} />)}
                            </div>
                        </div>
                    )}

                    {activeTab === 'nhamey' && (
                        <div className="flex justify-center items-center mb-10">
                            <div className="card-grid">
                                {nhameyData.map((place, i) => <PlaceCard key={i} place={place} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
