import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserById, followUser, unfollowUser, getAllUsers } from '../../api/usersApi';
import { getAllPosts, updatePost, deletePost, patchPost } from '../../api/postsApi';
import Post from '../../components/Post/Post';
import FollowerList from '../../components/FollowerList/FollowerList';
import './UserProfile.scss';

function UserProfile() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser && (currentUser._id === id || currentUser.id === id);

  // Загрузка профиля, постов и всех пользователей
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const [userData, postsData, usersData] = await Promise.all([
          getUserById(id),
          getAllPosts(),
          getAllUsers(),
        ]);

        setProfile(userData);
        setAllUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));

        const allPosts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
        const userPosts = allPosts.filter((p) => {
          const author = p.customer || p.author || p.user || {};
          const authorId = typeof author === 'string' ? author : (author._id || author.id);
          return authorId === id;
        });
        setPosts(userPosts);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Проверка: подписан ли я (currentUser) на этот профиль
  // currentUser.followers может содержать строки или объекты {_id, firstName, ...}
  const isFollowing = useCallback(() => {
    if (!currentUser || !profile) return false;
    const myFollowers = currentUser.followers || [];
    const targetId = profile._id || id;
    return myFollowers.some((f) => (typeof f === 'string' ? f : f?._id) === targetId);
  }, [currentUser, profile, id]);

  const handleFollow = async () => {
    if (!currentUser || !profile || followLoading) return;
    try {
      setFollowLoading(true);
      if (isFollowing()) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
      // Обновляем профиль после подписки/отписки
      const updatedProfile = await getUserById(id);
      setProfile(updatedProfile);
      // Обновляем текущего пользователя
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post || !currentUser) return;
      const likes = post.likes || [];
      const alreadyLiked = likes.some(
        (l) => (typeof l === 'string' ? l : l?._id) === currentUser._id
      );
      const updatedLikes = alreadyLiked
        ? likes.filter((l) => (typeof l === 'string' ? l : l?._id) !== currentUser._id)
        : [...likes, currentUser._id];
  const data = await patchPost(postId, { likes: updatedLikes });
      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEdit = async (postId, content) => {
    try {
      const data = await updatePost(postId, { content });
      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  if (loading) {
    return <div className="user-profile"><p className="user-profile__loading">Loading...</p></div>;
  }

  if (!profile) {
    return <div className="user-profile"><p className="user-profile__loading">User not found 😕</p></div>;
  }

  const displayName =
    profile.login ||
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
    'User';

  // profile.followedBy = кто подписан на этого пользователя (его фолловеры)
  // profile.followers = на кого подписан этот пользователь
  // Оба массива могут содержать объекты (populated) или строки
  const profileFollowedBy = profile.followedBy || [];
  const profileFollowing = profile.followers || [];

  // Мои подписки — извлекаем ID для проверки isFollowing
  const myFollowingIds = currentUser
    ? (currentUser.followers || []).map((f) => typeof f === 'string' ? f : f?._id)
    : [];

  const mapFollower = (f) => {
    // f может быть populated объектом или строкой
    if (typeof f === 'object' && f._id) {
      return {
        _id: f._id,
        username: f.login || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'User',
        avatar: f.avatarUrl || f.avatar,
        bio: f.bio || '',
        isFollowing: myFollowingIds.includes(f._id),
      };
    }
    // Строка — ищем в allUsers
    const fId = typeof f === 'string' ? f : f;
    const found = allUsers.find((u) => u._id === fId);
    if (found) {
      return {
        _id: found._id,
        username: found.login || `${found.firstName || ''} ${found.lastName || ''}`.trim() || 'User',
        avatar: found.avatarUrl || found.avatar,
        bio: found.bio || '',
        isFollowing: myFollowingIds.includes(found._id),
      };
    }
    return { _id: fId, username: 'User', isFollowing: myFollowingIds.includes(fId) };
  };

  const followersList = profileFollowedBy.map(mapFollower);
  const followingList = profileFollowing.map(mapFollower);

  const handleFollowFromList = async (userId) => {
    try {
      await followUser(userId);
      const updatedProfile = await getUserById(id);
      setProfile(updatedProfile);
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleUnfollowFromList = async (userId) => {
    try {
      await unfollowUser(userId);
      const updatedProfile = await getUserById(id);
      setProfile(updatedProfile);
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Unfollow failed:', err);
    }
  };

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        <img
          src={profile.avatarUrl || profile.avatar || 'https://i.pravatar.cc/100?u=' + id}
          alt=""
          className="user-profile__avatar"
        />
        <div className="user-profile__info">
          <h1 className="user-profile__name">{displayName}</h1>
          <p className="user-profile__bio">
            {profile.bio || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'No bio yet'}
          </p>
          <div className="user-profile__stats">
            <div className="user-profile__stat">
              <strong>{posts.length}</strong><span>Posts</span>
            </div>
            <div className="user-profile__stat">
              <strong>{profileFollowedBy.length}</strong><span>Followers</span>
            </div>
            <div className="user-profile__stat">
              <strong>{profileFollowing.length}</strong><span>Following</span>
            </div>
          </div>
        </div>

        {currentUser && !isOwnProfile && (
          <button
            className={`user-profile__follow-btn ${isFollowing() ? 'user-profile__follow-btn--following' : ''}`}
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? '...' : isFollowing() ? 'Unfollow' : 'Follow'}
          </button>
        )}

        {isOwnProfile && (
          <Link to="/account/settings" className="user-profile__settings-btn">⚙️ Settings</Link>
        )}
      </div>

      <div className="user-profile__tabs">
        <button
          className={`user-profile__tab ${tab === 'posts' ? 'user-profile__tab--active' : ''}`}
          onClick={() => setTab('posts')}
        >
          📝 Posts ({posts.length})
        </button>
        <button
          className={`user-profile__tab ${tab === 'followers' ? 'user-profile__tab--active' : ''}`}
          onClick={() => setTab('followers')}
        >
          👥 Followers ({profileFollowedBy.length})
        </button>
        <button
          className={`user-profile__tab ${tab === 'following' ? 'user-profile__tab--active' : ''}`}
          onClick={() => setTab('following')}
        >
          ➡️ Following ({profileFollowing.length})
        </button>
      </div>

      <div className="user-profile__content">
        {tab === 'posts' && (
          <div className="user-profile__posts">
            {posts.length > 0 ? (
              posts.map((p) => (
                <Post
                  key={p._id}
                  post={p}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <p className="user-profile__empty">No posts yet 📝</p>
            )}
          </div>
        )}

        {tab === 'followers' && (
          <FollowerList
            followers={followersList}
            onFollow={handleFollowFromList}
            onUnfollow={handleUnfollowFromList}
          />
        )}

        {tab === 'following' && (
          <FollowerList
            followers={followingList}
            onFollow={handleFollowFromList}
            onUnfollow={handleUnfollowFromList}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile;
