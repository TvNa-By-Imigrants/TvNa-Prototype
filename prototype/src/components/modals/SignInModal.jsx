import { useState } from 'react'

export default function SignInModal({ isOpen, onClose, onSwitch }) {
    const [showPassword, setShowPassword] = useState(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-(--signinbg) rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-(--text)">Sign In</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-(--bg-input) transition-colors">
                        <span className="material-symbols-outlined text-(--muted)">close</span>
                    </button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)">mail</span>
                        <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) transition-all" />
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)">lock</span>
                        <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--text) cursor-pointer">
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-(--muted) cursor-pointer">
                            <input type="checkbox" className="rounded" /> Remember me
                        </label>
                        <a href="#" className="text-(--indigo) hover:underline font-medium">Forgot password?</a>
                    </div>
                    <button type="submit" className="btn bg-(--indigo) text-white py-3 rounded-xl font-bold">Sign In</button>
                </form>

                <div className="flex items-center gap-4 my-5">
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                    <span className="text-xs text-(--muted)">or continue with</span>
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <button className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border-2 border-(--muted)/30 text-(--text) hover:bg-(--bg-input) font-medium transition-all">
                        <img src="/assets/google.webp" alt="Google" className="w-5 h-5" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl border-2 border-(--muted)/30 text-(--text) hover:bg-(--bg-input) font-medium transition-all">
                        <img src="/assets/facebook.webp" alt="Facebook" className="w-5 h-5" /> Facebook
                    </button>
                </div>

                <p className="text-center text-sm text-(--muted) mt-5">
                    Don't have an account?{' '}
                    <button onClick={onSwitch} className="text-(--indigo) font-semibold hover:underline cursor-pointer">Sign up</button>
                </p>
            </div>
        </div>
    )
}
