import FeedPostCard from '../components/cards/FeedPostCard.jsx'
import { communityData } from '../services/mockData.js'

export default function Community() {
    return (
        <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
            <div className="feed-container">
                <div className="create-post">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-(--indigo)/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-(--indigo)">person</span>
                        </div>
                        <button className="create-post-btn flex-1">What's on your mind?</button>
                    </div>
                    <div className="create-post-divider"></div>
                    <div className="flex gap-2">
                        <button className="create-post-action flex-1 justify-center">
                            <span className="material-symbols-outlined text-[18px]">photo</span>
                            Photo
                        </button>
                        <button className="create-post-action flex-1 justify-center">
                            <span className="material-symbols-outlined text-[18px]">place</span>
                            Place
                        </button>
                    </div>
                </div>

                {communityData.map((post, i) => (
                    <FeedPostCard key={i} post={post} />
                ))}
            </div>
        </main>
    )
}
