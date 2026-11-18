import { useState } from 'react'
import FeedPostCard from '../components/cards/FeedPostCard.jsx'
import { communityData } from '../services/mockData.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Community() {
    const { t } = useLanguage()
    const [posts, setPosts] = useState(communityData)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [images, setImages] = useState([])

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setCategory('')
        setImages([])
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!title.trim() || !description.trim()) return

        const newPost = {
            title: title.trim(),
            description: description.trim(),
            image: images.length > 0 ? images[0] : "/assets/visitPhnomPenh.webp",
            userName: "You",
            userPfp: "/assets/chay.webp",
            profileSlug: "you"
        }

        setPosts([newPost, ...posts])
        resetForm()
        setIsModalOpen(false)
    }

    const handleClose = () => {
        resetForm()
        setIsModalOpen(false)
    }

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
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="feed-container">
                <div className="create-post">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-(--indigo)/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-(--indigo)">person</span>
                        </div>
                        <button
                            className="create-post-btn flex-1"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {t('community.placeholder')}
                        </button>
                    </div>
                    <div className="create-post-divider"></div>
                    <div className="flex gap-2">
                        <button className="create-post-action flex-1 justify-center" onClick={() => setIsModalOpen(true)}>
                            <span className="material-symbols-outlined text-[18px]">photo</span>
                            {t('community.photo')}
                        </button>
                        <button className="create-post-action flex-1 justify-center" onClick={() => setIsModalOpen(true)}>
                            <span className="material-symbols-outlined text-[18px]">place</span>
                            {t('community.place')}
                        </button>
                    </div>
                </div>

                {posts.map((post, i) => (
                    <FeedPostCard key={i} post={post} />
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleClose}>
                    <div className="bg-(--signinbg) rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end p-4">
                            <button type="button" onClick={handleClose} className="p-2 rounded-lg hover:bg-(--bg-input) transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-(--muted)">close</span>
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            <h2 className="text-base sm:text-lg font-bold text-(--muted) mb-4">Post details</h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-(--muted) mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Post title"
                                        className="w-full px-4 py-3 rounded-lg border border-(--muted) bg-(--bg-input) text-(--text) focus:outline-none focus:ring-2 focus:ring-(--indigo) focus:border-(--indigo)"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-(--muted) mb-2">Which category best describes this post?</p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCategory('derlg')}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
                                                category === 'derlg'
                                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                                    : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'
                                            }`}
                                        >
                                            DerLg
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCategory('nhamey')}
                                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
                                                category === 'nhamey'
                                                    ? 'border-(--indigo) text-(--indigo) bg-(--indigo)/10'
                                                    : 'border-(--muted)/30 text-(--text) hover:border-(--indigo)/50'
                                            }`}
                                        >
                                            NhamEy
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-(--muted) mb-2">Add pictures</label>
                                    <div className="flex items-center justify-center h-40 rounded-xl bg-(--bg-input) border-2 border-dashed border-(--muted)">
                                        <label className="cursor-pointer flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-3xl text-(--muted)">cloud_upload</span>
                                            <p className="text-sm text-(--muted)">UPLOAD PHOTOS</p>
                                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                    {images.length > 0 && (
                                        <div className="mt-3 grid grid-cols-3 gap-2">
                                            {images.map((img, i) => (
                                                <img key={i} src={img} alt="" className="w-full h-20 rounded-lg object-cover" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-(--muted) mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Tell people about this..."
                                        className="w-full resize-none rounded-lg border border-(--muted) bg-(--bg-input) px-4 py-3 text-sm text-(--text) outline-none focus:border-(--indigo) focus:ring-2 focus:ring-(--indigo)"
                                    ></textarea>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <button type="submit" className="btn bg-(--indigo) text-white px-8 py-3 rounded-xl font-bold cursor-pointer">
                                        {t('community.post')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
