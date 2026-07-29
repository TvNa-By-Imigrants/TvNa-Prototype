import { createContext, useContext, useState } from 'react'

const translations = {
    en: {
        nav: {
            tvna: 'TvNa',
            plan: 'Plan',
            favourited: 'Favourited',
            community: 'Community',
            map: 'Map',
            signin: 'Sign in'
        },
        card: {
            goNow: 'Go Now',
            saved: 'Save'
        },
        home: {
            tabTvna: 'TvNa',
            tabDerlg: 'DerLg',
            tabNhamey: 'NhamEy'
        },
        community: {
            placeholder: "What's on your mind?",
            photo: 'Photo',
            place: 'Place',
            post: 'Post',
            cancel: 'Cancel'
        },
        favourited: {
            title: 'Favourited'
        },
        footer: {
            about: 'About us',
            facebook: 'Facebook',
            instagram: 'Instagram',
            contact: 'Contact'
        }
    },
    kh: {
        nav: {
            tvna: 'ទៅណា',
            plan: 'ផែនការ',
            favourited: 'រក្សាទុក',
            community: 'សហគមន៍',
            map: 'ផែនទី',
            signin: 'SignIn'
        },
        card: {
            goNow: 'ទៅឥឡូវ',
            saved: 'រក្សាទុក'
        },
        home: {
            tabTvna: 'ទៅណា',
            tabDerlg: 'ដើរលេង',
            tabNhamey: 'ញុំាអី'
        },
        community: {
            placeholder: 'ចែករំលែក',
            photo: 'រូបថត',
            place: 'កន្លែង',
            post: 'បង្ហោះ',
            cancel: 'លុបចោល'
        },
        favourited: {
            title: 'រក្សាទុក'
        },
        footer: {
            about: 'About us',
            facebook: 'Facebook',
            instagram: 'Instagram',
            contact: 'Contact'
        }
    }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en')

    const toggleLanguage = () => {
        const next = language === 'en' ? 'kh' : 'en'
        setLanguage(next)
        localStorage.setItem('language', next)
    }

    const t = (key) => {
        const keys = key.split('.')
        let result = translations[language]
        for (const k of keys) {
            result = result?.[k]
        }
        return result || key
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    return useContext(LanguageContext)
}
