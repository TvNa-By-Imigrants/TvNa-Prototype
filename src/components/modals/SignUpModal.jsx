import { useState } from 'react'

export default function SignUpModal({ isOpen, onClose, onSwitch }) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handlePasswordChange = (val) => {
        setPassword(val)
        if (confirmPassword && val !== confirmPassword) {
            setError('Passwords do not match')
        } else {
            setError('')
        }
    }

    const handleConfirmChange = (val) => {
        setConfirmPassword(val)
        if (val && password !== val) {
            setError('Passwords do not match')
        } else {
            setError('')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-(--signinbg) rounded-2xl shadow-xl p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-(--text)">Sign Up</h2>
                    <button onClick={onClose} className="text-(--muted) hover:text-(--text) cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">person</span>
                        <input type="text" placeholder="Username" className="w-full pl-12 pr-4 py-3 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo)" />
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">mail</span>
                        <input type="email" placeholder="Email" className="w-full pl-12 pr-4 py-3 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo)" />
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">lock</span>
                        <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => handlePasswordChange(e.target.value)} className="w-full pl-12 pr-12 py-3 rounded-xl border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo)" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) cursor-pointer">
                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">lock</span>
                        <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={e => handleConfirmChange(e.target.value)} className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) ${error ? 'border-red-500' : 'border-(--muted)'}`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) cursor-pointer">
                            <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="btn bg-(--indigo) text-white py-3 rounded-full font-bold" disabled={!!error}>Sign Up</button>
                </form>

                <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                    <span className="text-xs text-(--muted)">or</span>
                    <div className="flex-1 h-px bg-(--muted)/30"></div>
                </div>

                <div className="flex flex-col gap-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-(--muted) text-(--text) hover:bg-(--bg-input) font-medium">
                        <img src="/assets/google.webp" alt="Google" className="w-5 h-5" /> Continue with Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-full border border-(--muted) text-(--text) hover:bg-(--bg-input) font-medium">
                        <img src="/assets/facebook.webp" alt="Facebook" className="w-5 h-5" /> Continue with Facebook
                    </button>
                </div>

                <p className="text-center text-sm text-(--muted) mt-4">
                    Already have an account?{' '}
                    <button onClick={onSwitch} className="text-(--indigo) font-medium hover:underline cursor-pointer">Sign in</button>
                </p>
            </div>
        </div>
    )
}
