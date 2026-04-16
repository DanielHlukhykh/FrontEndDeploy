import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllPosts, createPost, deletePost, updatePost, patchPost } from '../../api/postsApi';
import SearchBar from '../../components/Search/SearchBar';
import PostForm from '../../components/Post/PostForm';
import Post from '../../components/Post/Post';
import './Home.scss';

const POSTS_PER_PAGE = 15;

function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Загрузка постов (первая страница)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setPage(1);
        const data = await getAllPosts({ perPage: POSTS_PER_PAGE, startPage: 1 });
        const list = Array.isArray(data) ? data : (data.posts || []);
        setPosts(list);
        // Если вернулось меньше чем запросили — больше постов нет
        setHasMore(list.length >= POSTS_PER_PAGE);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Загрузка следующей страницы
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await getAllPosts({ perPage: POSTS_PER_PAGE, startPage: nextPage });
      const list = Array.isArray(data) ? data : (data.posts || []);
      if (list.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...list]);
        setPage(nextPage);
        setHasMore(list.length >= POSTS_PER_PAGE);
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  const handleCreatePost = useCallback(async (formData) => {
    try {
      const postData = {
        content: formData.content,
      };
      if (formData.image) postData.imageUrl = formData.image;
      if (formData.awardId) postData.award = formData.awardId;

      const data = await createPost(postData);
      setPosts((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  }, []);

  const handleLike = useCallback(async (postId) => {
    // Бекенд может не иметь отдельного роута для лайков
    // Можно реализовать через PUT /api/posts/:id с обновлением likes
    try {
      const post = posts.find((p) => p._id === postId);
      if (!post || !user) return;

      const userId = user._id;
      const likes = post.likes || [];
      const alreadyLiked = likes.includes(userId);

      const updatedLikes = alreadyLiked
        ? likes.filter((id) => id !== userId)
        : [...likes, userId];

  const data = await patchPost(postId, { likes: updatedLikes });
      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  }, [posts, user]);

  const handleDelete = useCallback(async (postId) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  }, []);

  const handleEdit = useCallback(async (postId, newContent) => {
    try {
      const data = await updatePost(postId, { content: newContent });
      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
    } catch (err) {
      console.error('Failed to edit post:', err);
    }
  }, []);

  // Фильтрация
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase();
      const authorName =
        p.customer?.login ||
        p.customer?.firstName ||
        p.author?.login ||
        p.author?.firstName ||
        '';
      const matchesSearch =
        !q ||
        (p.content || '').toLowerCase().includes(q) ||
        authorName.toLowerCase().includes(q);

      if (filter === 'awards') return matchesSearch && p.award;
      return matchesSearch;
    });
  }, [posts, search, filter]);

  return (
    <div className="home">
      <aside className="home__sidebar">
        <div className="home__welcome">
          <h2>🏋️ FitTrack</h2>
          <p>Track goals, share progress, stay motivated.</p>
        </div>
        <div className="home__stats-card">
          <div className="home__stat">
            <span className="home__stat-num">{posts.length}</span>
            <span className="home__stat-label">Posts</span>
          </div>
        </div>
      </aside>

      <div className="home__feed">
        <SearchBar value={search} onChange={setSearch} placeholder="Search posts, users..." />

        <div className="home__filters">
          <button
            className={`home__filter-btn ${filter === 'all' ? 'home__filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Posts
          </button>
          <button
            className={`home__filter-btn ${filter === 'awards' ? 'home__filter-btn--active' : ''}`}
            onClick={() => setFilter('awards')}
          >
            🏆 With Awards
          </button>
        </div>

        {user && <PostForm onSubmit={handleCreatePost} />}

        <div className="home__posts">
          {loading ? (
            <div className="home__empty"><p>Loading...</p></div>
          ) : filtered.length > 0 ? (
            <>
              {filtered.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
              {hasMore && !search && filter === 'all' && (
                <div className="home__load-more">
                  <button
                    className="home__load-more-btn"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="home__empty"><p>😕 No posts found</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;