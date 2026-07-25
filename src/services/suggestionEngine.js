import { derlgData, nhameyData } from './mockData.js'

const allPlaces = [...derlgData, ...nhameyData]

export function suggestPlaces({ category, tvrean, area }) {
    let pool = [...allPlaces]

    if (category === 'nhamey') {
        pool = pool.filter(p => p.type === 'restaurant')
    } else if (category === 'derlg') {
        pool = pool.filter(p => ['arcade', 'park', 'cafe'].includes(p.type))
    }

    if (tvrean === 'cafe') {
        pool = pool.filter(p => p.type === 'cafe')
    } else if (tvrean === 'library') {
        pool = pool.filter(p => p.type === 'cafe')
    }

    if (area) {
        pool = pool.filter(p => p.area.toLowerCase().includes(area.toLowerCase()))
    }

    return pool.map(p => ({
        ...p,
        score: Math.floor(Math.random() * 15) + 85
    })).sort((a, b) => b.score - a.score)
}
