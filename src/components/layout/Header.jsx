import { useState } from 'react'
import { Link } from 'react-router-dom'
import SignInModal from '../modals/SignInModal.jsx'
import SignUpModal from '../modals/SignUpModal.jsx'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [closing, setClosing] = useState(false)
    const [signInOpen, setSignInOpen] = useState(false)
    const [signUpOpen, setSignUpOpen] = useState(false)
    const { language, toggleLanguage, t } = useLanguage()

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setMobileOpen(false)
            setClosing(false)
        }, 250)
    }

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark')
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark'
        } else {
            localStorage.theme = 'light'
        }
    }

    const isDark = document.documentElement.classList.contains('dark')

    return (
        <>
            <header className="z-50 sticky top-0 left-0 w-full px-6 py-5 shadow-sm bg-(--bg) text-(--text) border-b border-(--muted)/10">
                <div className="max-w-(--max-width) mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-4">
                    <div className="flex items-center">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center justify-center rounded-xl p-2 hover:bg-(--bg-input) transition-colors mr-2">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <Link to="/" className="flex items-center justify-center gap-3">
                            <div className="flex w-10 h-10 rounded-xl bg-(--indigo)/10 overflow-hidden items-center justify-center">
                                <img src="/assets/TvNa.png" alt="logo" className="w-full h-full object-fill" />
                            </div>
                            <div className="text-2xl font-bold text-(--indigo)">TvNa</div>
                        </Link>
                    </div>

                    <div></div>

                    <div className="flex items-center justify-center gap-3">
                        <button onClick={toggleTheme} className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-(--bg-input) transition-colors">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>
                        <button onClick={toggleLanguage} className="flex items-center justify-center h-10 px-3 rounded-xl hover:bg-(--bg-input) transition-colors text-sm font-bold text-(--muted)">
                            {language === 'en' ? 'EN' : 'KH'}
                        </button>
                        <nav className="hidden lg:flex gap-2 mr-2">
                            <Link to="/" className="px-4 py-2 rounded-lg font-semibold text-sm hover:bg-(--bg-input) hover:text-(--indigo) transition-all">{t('nav.tvna')}</Link>
                            <Link to="/plan" className="px-4 py-2 rounded-lg font-semibold text-sm hover:bg-(--bg-input) hover:text-(--indigo) transition-all">{t('nav.plan')}</Link>
                            <Link to="/favourited" className="px-4 py-2 rounded-lg font-semibold text-sm hover:bg-(--bg-input) hover:text-(--indigo) transition-all">{t('nav.favourited')}</Link>
                            <Link to="/community" className="px-4 py-2 rounded-lg font-semibold text-sm hover:bg-(--bg-input) hover:text-(--indigo) transition-all">{t('nav.community')}</Link>
                            <Link to="/map" className="px-4 py-2 rounded-lg font-semibold text-sm hover:bg-(--bg-input) hover:text-(--indigo) transition-all">{t('nav.map')}</Link>
                        </nav>
                        <button onClick={() => setSignInOpen(true)} className="btn bg-(--indigo) text-sm py-2 px-4">{t('nav.signin')}</button>
                    </div>
                </div>
            </header>

            {mobileOpen && (
                <div className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm ${closing ? 'animate-fadeOut' : 'animate-fadeIn'}`} onClick={handleClose}>
                    <div className={`fixed top-0 left-0 w-72 h-full shadow-xl bg-(--bg) flex flex-col p-6 gap-6 text-(--text) ${closing ? 'animate-slideOut' : 'animate-slideIn'}`} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-(--indigo)/10 overflow-hidden">
                                    <img src="/assets/TvNa.png" alt="logo" className="w-full h-full object-fill" />
                                </div>
                                <span className="text-xl font-bold text-(--indigo)">TvNa</span>
                            </div>
                            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-(--bg-input) transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav className="flex flex-col gap-2">
                            <Link to="/" className="px-4 py-3 rounded-xl font-semibold hover:bg-(--bg-input) transition-all" onClick={handleClose}>{t('nav.tvna')}</Link>
                            <Link to="/plan" className="px-4 py-3 rounded-xl font-semibold hover:bg-(--bg-input) transition-all" onClick={handleClose}>{t('nav.plan')}</Link>
                            <Link to="/favourited" className="px-4 py-3 rounded-xl font-semibold hover:bg-(--bg-input) transition-all" onClick={handleClose}>{t('nav.favourited')}</Link>
                            <Link to="/community" className="px-4 py-3 rounded-xl font-semibold hover:bg-(--bg-input) transition-all" onClick={handleClose}>{t('nav.community')}</Link>
                            <Link to="/map" className="px-4 py-3 rounded-xl font-semibold hover:bg-(--bg-input) transition-all" onClick={handleClose}>{t('nav.map')}</Link>
                        </nav>
                    </div>
                </div>
            )}

            <SignInModal
                isOpen={signInOpen}
                onClose={() => setSignInOpen(false)}
                onSwitch={() => { setSignInOpen(false); setSignUpOpen(true) }}
            />
            <SignUpModal
                isOpen={signUpOpen}
                onClose={() => setSignUpOpen(false)}
                onSwitch={() => { setSignUpOpen(false); setSignInOpen(true) }}
            />
        </>
    )
}
