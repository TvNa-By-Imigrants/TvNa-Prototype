import { useState } from 'react'
import { Link } from 'react-router-dom'
import SignInModal from '../modals/SignInModal.jsx'
import SignUpModal from '../modals/SignUpModal.jsx'

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [signInOpen, setSignInOpen] = useState(false)
    const [signUpOpen, setSignUpOpen] = useState(false)

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark')
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark'
        } else {
            localStorage.theme = 'light'
        }
    }

    return (
        <>
            <header className="z-50 sticky top-0 left-0 w-full px-6 py-4 shadow-md bg-(--bg) text-(--text)">
                <div className="max-w-(--max-width) mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-2">
                    <div className="flex items-center">
                        <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center justify-center rounded-md focus:outline-none pr-3">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex items-center justify-center gap-2.5">
                            <div className="flex w-10 h-10 rounded-full bg-(--bg) text-(--text) overflow-hidden">
                                <img src="/icons.svg" alt="logo" className="w-full h-full object-fill rounded-full" />
                            </div>
                            <div className="text-2xl font-bold text-(--indigo)">TvNa</div>
                        </div>
                    </div>

                    <div></div>

                    <div className="flex items-center justify-center">
                        <button onClick={toggleTheme} className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-neutral-400 transition mr-3">
                            <span className="material-symbols-outlined">dark_mode</span>
                            <span className="hidden-content material-symbols-outlined">light_mode</span>
                        </button>
                        <nav className="hidden lg:flex gap-4 mr-3">
                            <Link to="/" className="font-bold hover:text-(--indigo)">TvNa</Link>
                            <Link to="/plan" className="font-bold hover:text-(--indigo)">Plan</Link>
                            <Link to="/favourited" className="font-bold hover:text-(--indigo)">Favourited</Link>
                            <Link to="/community" className="font-bold hover:text-(--indigo)">Community</Link>
                            <Link to="/map" className="font-bold hover:text-(--indigo)">Map</Link>
                        </nav>
                        <button onClick={() => setSignInOpen(true)} className="btn bg-[#741EFF]">Sign in</button>
                    </div>
                </div>
            </header>

            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-9999" onClick={() => setMobileOpen(false)}>
                    <div className="fixed top-0 left-0 w-1/2 h-full shadow-lg bg-(--bg) flex flex-col p-6 gap-6 text-(--text)" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setMobileOpen(false)} className="self-end text-(--text) focus:outline-none cursor-pointer">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <Link to="/" className="font-bold hover:text-(--indigo)" onClick={() => setMobileOpen(false)}>TvNa</Link>
                        <Link to="/plan" className="font-bold hover:text-(--indigo)" onClick={() => setMobileOpen(false)}>Plan</Link>
                        <Link to="/favourited" className="font-bold hover:text-(--indigo)" onClick={() => setMobileOpen(false)}>Favourited</Link>
                        <Link to="/community" className="font-bold hover:text-(--indigo)" onClick={() => setMobileOpen(false)}>Community</Link>
                        <Link to="/map" className="font-bold hover:text-(--indigo)" onClick={() => setMobileOpen(false)}>Map</Link>
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
