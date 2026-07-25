import { useState, useRef } from 'react'
import PlaceCard from '../components/cards/PlaceCard.jsx'
import { derlgData, nhameyData } from '../services/mockData.js'

const tabs = [
    { id: 'tvna', label: 'TvNa', icon: 'not_listed_location' },
    { id: 'derlg', label: 'DerLg', icon: 'footprint' },
    { id: 'nhamey', label: 'NhamEy', icon: 'yoshoku' }
]

function ScrollCarousel({ title, data }) {
    const scrollRef = useRef(null)

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 400, behavior: 'smooth' })
        }
    }

    return (
        <div>
            <h2 className="text-[18px] md:text-[22px] font-bold text-(--text)">{title}</h2>
            <div className="relative slider">
                <button onClick={() => scroll(-1)} className="absolute z-50 left-0 top-1/2 -translate-y-1/2 flex p-1.5 border rounded-full text-(--text) bg-(--bg) hover:bg-(--hover-btn)">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div ref={scrollRef} className="flex p-2.5 pb-10 overflow-x-auto gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
                    {data.map((place, i) => <PlaceCard key={i} place={place} />)}
                </div>
                <button onClick={() => scroll(1)} className="absolute z-50 right-0 top-1/2 -translate-y-1/2 flex p-1.5 border rounded-full text-(--text) bg-(--bg) hover:bg-(--hover-btn)">
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}

export default function Home() {
    const [activeTab, setActiveTab] = useState('tvna')

    return (
        <main className="px-6 py-4 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto flex flex-col items-center my-2.5 gap-2.5">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">TvNa?</h1>

                <nav className="flex gap-10 mb-2.5 md:text-[18px] lg:gap-15 lg:text-[20px]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1 p-1 border-b-2 transition-all cursor-pointer ${
                                activeTab === tab.id
                                    ? 'active-tab border-(--indigo)'
                                    : 'border-transparent hover:text-(--hover-text) hover:border-(--hover-text)'
                            }`}
                        >
                            <span className="material-symbols-outlined">{tab.icon}</span>
                            <span className="font-bold">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {activeTab === 'tvna' && (
                    <div className="w-full mb-5 overflow-hidden rounded-[10px] relative">
                        <div className="animated-slide flex w-[300%]">
                            <img src="/assets/visitPhnomPenh.webp" alt="visitPhnomPenh" className="w-1/3 shrink-0" />
                            <img src="/assets/museum.webp" alt="museum" className="w-1/3 shrink-0" />
                            <img src="/assets/funmall.webp" alt="funmall" className="w-1/3 shrink-0" />
                        </div>
                    </div>
                )}

                <div className="w-full">
                    {activeTab === 'tvna' && (
                        <div className="flex flex-col gap-8">
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
