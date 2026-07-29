import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext.jsx'
import { goNowLink } from '../../services/mapLinks.js'

export default function PlaceCard({ place }) {
    const { t } = useLanguage()

    return (
        <div className="card">
            <img src={place.image} alt={place.title} className="card-image" />
            <div className="card-body">
                <h3 className="card-title">{place.title}</h3>
                <p className="card-description">{place.description}</p>
                <div className="flex gap-2 mt-auto">
                    <Link to="/favourited" className="btn-outline text-sm py-2 px-4 rounded-xl flex-1 text-center">{t('card.saved')}</Link>
                    <a
                        href={goNowLink(place.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn text-sm py-2 px-4 rounded-xl flex-1"
                    >
                        {t('card.goNow')}
                    </a>
                </div>
            </div>
        </div>
    )
}
