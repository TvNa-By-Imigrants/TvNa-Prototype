import { useParams, Link } from 'react-router-dom'
import { profilesData, communityData } from '../services/mockData.js'
import FeedPostCard from '../components/cards/FeedPostCard.jsx'

export default function Profile() {
    const { slug } = useParams()
    const profile = profilesData[slug]

    if (!profile) {
        return (
            <main className="px-6 py-8 w-full bg-(--bg) text-(--text)">
                <div className="max-w-(--max-width) mx-auto text-center py-20">
                    <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
                    <Link to="/community" className="text-(--indigo) hover:underline">← Back to Community</Link>
                </div>
            </main>
        )
    }

    const userPosts = communityData.filter(p => p.profileSlug === slug)

    return (
        <main className="w-full bg-(--bg) text-(--text)">
            <div className="profile-cover" style={{ backgroundColor: profile.cover }}></div>
            <div className="max-w-(--max-width) mx-auto px-6">
                <div className="profile-info">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            <img src={profile.pfp} alt={profile.name} />
                        </div>
                    </div>
                    <div className="profile-details">
                        <h1 className="text-2xl font-bold">{profile.name}</h1>
                        <p className="text-(--muted)">{profile.username}</p>
                    </div>
                    <button className="edit-profile-btn btn bg-(--indigo) text-white rounded-full">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit Profile
                    </button>
                </div>

                <p className="profile-bio">{profile.bio}</p>
                <div className="profile-meta">
                    <span className="material-symbols-outlined text-[16px] text-(--muted)">location_on</span>
                    <span className="text-sm text-(--muted)">{profile.location}</span>
                    <span className="mx-2 text-(--muted)">·</span>
                    <span className="material-symbols-outlined text-[16px] text-(--muted)">calendar_month</span>
                    <span className="text-sm text-(--muted)">Joined {profile.joinDate}</span>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-number">{profile.posts}</span>
                        <span className="stat-label text-(--muted)">Posts</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{profile.followers}</span>
                        <span className="stat-label text-(--muted)">Followers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{profile.following}</span>
                        <span className="stat-label text-(--muted)">Following</span>
                    </div>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-posts-feed">
                    {userPosts.map((post, i) => (
                        <FeedPostCard key={i} post={post} />
                    ))}
                </div>
            </div>
        </main>
    )
}
