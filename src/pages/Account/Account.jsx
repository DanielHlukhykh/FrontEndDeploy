import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllPosts, deletePost, updatePost } from '../../api/postsApi';
import { getAllAwards } from '../../api/awardsApi';
import { followUser, unfollowUser, getAllUsers } from '../../api/usersApi';
import Post from '../../components/Post/Post';
import AwardCard from '../../components/Awards/AwardCard';
import ProgressBar from '../../components/Progress/ProgressBar';
import FollowerList from '../../components/FollowerList/FollowerList';
import './Account.scss';

function Account() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('posts');
  const [allUsers, setAllUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
      
    }

    const fetchData = async () => {
      try {
        // Загружаем посты и фильтруем по текущему юзеру
        const postsData = await getAllPosts();
        const allPosts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
        const myPosts = allPosts.filter((p) => {
          const author = p.customer || p.author || p.user || {};
          const authorId = typeof author === 'string' ? author : (author._id || author.id);
          return authorId === user._id || authorId === user.id;
        });
        setPosts(myPosts);

        // Загружаем награды и фильтруем по текущему юзеру
        const awardsData = await getAllAwards();
        const allAwards = Array.isArray(awardsData) ? awardsData : (awardsData.awards || []);
        const myAwards = allAwards.filter((a) => {
          const owner = a.customer || a.author || a.user || {};
          const ownerId = typeof owner === 'string' ? owner : (owner._id || owner.id);
          return ownerId === user._id || ownerId === user.id;
        });
        setAwards(myAwards);

        // Загружаем всех пользователей для отображения подписок
        const usersData = await getAllUsers();
        const usersList = Array.isArray(usersData) ? usersData : (usersData.users || []);
        setAllUsers(usersList);
      } catch (err) {
        console.error('Failed to load account data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="account__no-auth">
        <h2>👤 Please log in</h2>
        <Link to="/login" className="account__login-btn">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="account"><p style={{ textAlign: 'center', padding: 40 }}>Loading...</p></div>;
  }

  const displayName = user.login || user.firstName || 'User';

  const handleLike = async (postId) => {
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post) return;
      const likes = post.likes || [];
      const alreadyLiked = likes.some(
        (l) => (typeof l === 'string' ? l : l?._id) === user._id
      );
      const updatedLikes = alreadyLiked
        ? likes.filter((l) => (typeof l === 'string' ? l : l?._id) !== user._id)
        : [...likes, user._id];
      const data = await updatePost(postId, { likes: updatedLikes });
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

  return (
    <div className="account">
      <div className="account__profile">
        <img
          src={user.avatarUrl || user.avatar || 'https://i.pravatar.cc/100'}
          alt=""
          className="account__avatar"
        />
        <div className="account__info">
          <h1 className="account__name">{displayName}</h1>
          <p className="account__bio">
            {user.bio || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No bio yet'}
          </p>
          <div className="account__stats">
            <div className="account__stat">
              <strong>{posts.length}</strong><span>Posts</span>
            </div>
            <div className="account__stat">
              <strong>{(user.followers || []).length}</strong><span>Followers</span>
            </div>
            <div className="account__stat">
              <strong>{(user.following || []).length}</strong><span>Following</span>
            </div>
            <div className="account__stat">
              <strong>{awards.length}</strong><span>Awards</span>
            </div>
          </div>
        </div>
        <Link to="/account/settings" className="account__settings-btn">⚙️ Settings</Link>
      </div>

      {awards.length > 0 && (
        <div className="account__progress-overview">
          <h3>📊 Progress Overview</h3>
          <div className="account__progress-grid">
            {awards.map((a) => (
              <div key={a._id} className="account__progress-item">
                <span className="account__progress-title">{a.title}</span>
                <ProgressBar
                  current={a.currentValue || 0}
                  target={a.targetValue || 100}
                  unit={a.unit || ''}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="account__tabs">
        <button
          className={`account__tab ${tab === 'posts' ? 'account__tab--active' : ''}`}
          onClick={() => setTab('posts')}
        >
          📝 Posts ({posts.length})
        </button>
        <button
          className={`account__tab ${tab === 'awards' ? 'account__tab--active' : ''}`}
          onClick={() => setTab('awards')}
        >
          🏆 Awards ({awards.length})
        </button>
        <button
          className={`account__tab ${tab === 'followers' ? 'account__tab--active' : ''}`}
          onClick={() => setTab('followers')}
        >
          👥 Followers ({(user.followedBy || []).length})
        </button>
        <button
          className={`account__tab ${tab === 'following' ? 'account__tab--active' : ''}`}
          onClick={() => setTab('following')}
        >
          ➡️ Following ({(user.followers || []).length})
        </button>
      </div>

      <div className="account__content">
        {tab === 'posts' && (
          <div className="account__posts">
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
              <p className="account__empty">No posts yet. Go to Feed to create your first post! 🏋️</p>
            )}
          </div>
        )}

        {tab === 'awards' && (
          <div className="account__awards-grid">
            {awards.length > 0 ? (
              awards.map((a) => <AwardCard key={a._id} award={a} />)
            ) : (
              <p className="account__empty">No awards yet. Go to Awards to create your first goal! 🎯</p>
            )}
          </div>
        )}

        {tab === 'followers' && (
          <FollowerList
            followers={(user.followedBy || []).map((f) => {
              const fId = typeof f === 'string' ? f : f._id;
              const myFollowingIds = (user.followers || []).map((x) => typeof x === 'string' ? x : x._id);
              // f может быть объектом (populated) или строкой
              if (typeof f === 'object' && f._id) {
                return {
                  _id: f._id,
                  username: f.login || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'User',
                  avatar: f.avatarUrl || f.avatar,
                  bio: f.bio || '',
                  isFollowing: myFollowingIds.includes(f._id),
                };
              }
              // Если строка — ищем в allUsers
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
            })}
            onFollow={async (userId) => {
              try {
                await followUser(userId);
                if (refreshUser) await refreshUser();
              } catch (err) { console.error('Follow failed:', err); }
            }}
            onUnfollow={async (userId) => {
              try {
                await unfollowUser(userId);
                if (refreshUser) await refreshUser();
              } catch (err) { console.error('Unfollow failed:', err); }
            }}
          />
        )}

        {tab === 'following' && (
          <FollowerList
            followers={(user.followers || []).map((f) => {
              const fId = typeof f === 'string' ? f : f._id;
              if (typeof f === 'object' && f._id) {
                return {
                  _id: f._id,
                  username: f.login || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'User',
                  avatar: f.avatarUrl || f.avatar,
                  bio: f.bio || '',
                  isFollowing: true,
                };
              }
              const found = allUsers.find((u) => u._id === fId);
              if (found) {
                return {
                  _id: found._id,
                  username: found.login || `${found.firstName || ''} ${found.lastName || ''}`.trim() || 'User',
                  avatar: found.avatarUrl || found.avatar,
                  bio: found.bio || '',
                  isFollowing: true,
                };
              }
              return { _id: fId, username: 'User', isFollowing: true };
            })}
            onFollow={async (userId) => {
              try {
                await followUser(userId);
                if (refreshUser) await refreshUser();
              } catch (err) { console.error('Follow failed:', err); }
            }}
            onUnfollow={async (userId) => {
              try {
                await unfollowUser(userId);
                if (refreshUser) await refreshUser();
              } catch (err) { console.error('Unfollow failed:', err); }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Account;