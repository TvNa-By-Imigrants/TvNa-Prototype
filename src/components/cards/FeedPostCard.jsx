import { useNavigate } from 'react-router-dom'

export default function FeedPostCard({ post }) {
    const navigate = useNavigate()

    return (
        <div className="feed-post">
            <div className="post-header">
                <div className="flex items-center gap-3">
                    <img src={post.userPfp} alt={post.userName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <button
                            onClick={() => navigate(`/profile/${post.profileSlug}`)}
                            className="font-semibold text-(--text) hover:text-(--indigo) cursor-pointer"
                        >
                            {post.userName}
                        </button>
                        <p className="text-xs text-(--muted)">{post.title}</p>
                    </div>
                </div>
            </div>
            <p className="post-description">{post.description}</p>
            <img src={post.image} alt={post.title} className="post-image" />
            <div className="post-actions">
                <button className="post-btn">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    Like
                </button>
                <button className="post-btn">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                    Comment
                </button>
                <button className="post-btn">
                    <span className="material-symbols-outlined text-[18px]">share</span>
                    Share
                </button>
            </div>
        </div>
    )
}
