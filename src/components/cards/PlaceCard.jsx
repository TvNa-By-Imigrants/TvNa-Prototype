import { goNowLink } from '../../services/mapLinks.js'

export default function PlaceCard({ place }) {
    return (
        <div className="card">
            <img src={place.image} alt={place.title} className="card-image" />
            <div className="card-body">
                <h3 className="card-title">{place.title}</h3>
                <p className="card-description">{place.description}</p>
                <div className="flex gap-2 mt-auto">
                    <button className="btn text-sm py-2 px-4 rounded-full flex-1">Jam Tv</button>
                    <a
                        href={goNowLink(place.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn text-sm py-2 px-4 rounded-full flex-1 bg-(--hover-btn)"
                    >
                        Tv Lv
                    </a>
                </div>
            </div>
        </div>
    )
}
