import { favouriteData } from '../services/mockData.js'
import PlaceCard from '../components/cards/PlaceCard.jsx'

export default function Favourited() {
    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="max-w-(--max-width) mx-auto">
                <h1 className="text-3xl font-bold mb-8">Favourited</h1>
                <div className="card-grid">
                    {favouriteData.map((place, i) => (
                        <PlaceCard key={i} place={place} />
                    ))}
                </div>
            </div>
        </main>
    )
}
