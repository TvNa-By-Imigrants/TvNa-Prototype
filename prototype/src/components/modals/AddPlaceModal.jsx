import { useState } from 'react'

export default function AddPlaceModal({ isOpen, onClose }) {
    const [category, setCategory] = useState('')
    const [images, setImages] = useState([])

    if (!isOpen) return null

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        files.forEach(file => {
            if (!file.type.startsWith('image/')) return
            const reader = new FileReader()
            reader.onload = (ev) => {
                setImages(prev => [...prev, ev.target.result])
            }
            reader.readAsDataURL(file)
        })
        e.target.value = ''
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-(--signinbg) rounded-2xl shadow-xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-(--text)">HvKneaDerJmuy</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-(--bg-input) transition-colors">
                        <span className="material-symbols-outlined text-(--muted)">close</span>
                    </button>
                </div>

                <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                    <input type="text" placeholder="Name" className="w-full px-4 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) transition-all" />
                    <input type="text" placeholder="Address" className="w-full px-4 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) transition-all" />

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setCategory('derlg')} className={`flex-1 py-2.5 rounded-xl font-medium border-2 cursor-pointer transition-all ${category === 'derlg' ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10' : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'}`}>DerLg</button>
                        <button type="button" onClick={() => setCategory('nhamey')} className={`flex-1 py-2.5 rounded-xl font-medium border-2 cursor-pointer transition-all ${category === 'nhamey' ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10' : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'}`}>NhamEy</button>
                    </div>

                    <div className="border-2 border-dashed border-(--muted)/40 rounded-xl p-6 text-center cursor-pointer hover:border-(--indigo)/50 transition-all">
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="imageUpload" />
                        <label htmlFor="imageUpload" className="cursor-pointer">
                            <span className="material-symbols-outlined text-3xl text-(--muted)">cloud_upload</span>
                            <p className="text-sm text-(--muted) mt-2">Drag & drop or click to upload images</p>
                        </label>
                    </div>

                    {images.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {images.map((img, i) => (
                                <img key={i} src={img} alt={`upload-${i}`} className="w-full h-20 object-cover rounded-lg" />
                            ))}
                        </div>
                    )}

                    <textarea placeholder="Additional info (price range, hours, environment...)" rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-(--muted)/40 bg-(--bg-input) text-(--text) focus:outline-none focus:border-(--indigo) resize-none transition-all"></textarea>

                    <button type="submit" className="btn bg-(--indigo) text-white py-3 rounded-xl font-bold">Save & Submit</button>
                </form>
            </div>
        </div>
    )
}
