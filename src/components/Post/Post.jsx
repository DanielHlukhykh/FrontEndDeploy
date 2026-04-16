import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { followUser, unfollowUser } from '../../api/usersApi';
import { getAwardById } from '../../api/awardsApi';
import CommentList from '../Comment/CommentList';
import { formatDate } from '../../utils/formatDate';
import './Post.scss';

function Post({ post, onLike, onDelete, onEdit }) {
  const { user, refreshUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content || '');
  const [followLoading, setFollowLoading] = useState(false);
  const [awardData, setAwardData] = useState(null);

  // Подгружаем данные награды, если award — это строка (ID)
  useEffect(() => {
    if (post.award && typeof post.award === 'string') {
      getAwardById(post.award)
        .then((data) => setAwardData(data))
        .catch(() => setAwardData(null));
    } else if (post.award && typeof post.award === 'object') {
      setAwardData(post.award);
    }
  }, [post.award]);

  // Бекенд может хранить автора в customer или author
  const author = post.customer || post.author || post.user || {};
  const authorId = typeof author === 'string' ? author : author._id;
  const authorName = typeof author === 'object' 
    ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.login || 'User'
    : 'User';

  const authorAvatar = typeof author === 'object'
  ? (author.avatarUrl || author.avatar || '/default-avatar.png')
    : 'https://i.pravatar.cc/40';

  const isOwner = user && user._id === authorId;

  // Лайки
  const likes = post.likes || [];
  const isLiked = user && likes.some(
    (l) => (typeof l === 'string' ? l === user._id : l?._id === user._id)
  );
  const likesCount = likes.length;

  // Комментарии — количество
  const commentsCount = post.comments?.length || 0;

  // Подписка — проверяем, подписан ли текущий пользователь на автора поста
  // followers может содержать строки или объекты {_id, firstName, ...}
  const myFollowing = user ? (user.followers || []) : [];
  const isFollowingAuthor = user && !isOwner && authorId && myFollowing.some(
    (f) => (typeof f === 'string' ? f : f?._id) === authorId
  );

  const handleToggleFollow = async () => {
    if (!user || isOwner || !authorId || followLoading) return;
    try {
      setFollowLoading(true);
      if (isFollowingAuthor) {
        await unfollowUser(authorId);
      } else {
        await followUser(authorId);
      }
      if (refreshUser) await refreshUser();
    } catch (err) {
      console.error('Follow/unfollow failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSave = () => {
    if (editText.trim() && onEdit) {
      onEdit(post._id, editText.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditText(post.content || '');
    setEditing(false);
  };

  return (
    <article className="post">
      <div className="post__header">
        <Link to={authorId ? `/user/${authorId}` : '#'} className="post__author">
          <img src={authorAvatar} alt="" className="post__author-avatar" />
          <div className="post__author-info">
            <span className="post__author-name">{authorName}</span>
            <span className="post__date">
              {formatDate(post.date || post.createdAt)}
            </span>
          </div>
        </Link>

        <div className="post__header-actions">
          {user && !isOwner && authorId && (
            <button
              className={`post__follow-btn ${isFollowingAuthor ? 'post__follow-btn--following' : ''}`}
              onClick={handleToggleFollow}
              disabled={followLoading}
            >
              {followLoading ? '...' : isFollowingAuthor ? 'Following' : 'Follow'}
            </button>
          )}

          {isOwner && (
            <div className="post__actions">
            <button className="post__action-btn" onClick={() => setEditing(!editing)} title="Edit">
              ✏️
            </button>
            <button
              className="post__action-btn post__action-btn--danger"
              onClick={() => onDelete && onDelete(post._id)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
        </div>
      </div>

      {post.award && awardData && (
        <div className="post__award-badge">
          <span>🏆</span>{' '}
          {awardData.title || 'Award'}
          {awardData.description && (
            <span className="post__award-desc"> — {awardData.description}</span>
          )}
        </div>
      )}

      <div className="post__body">
        {editing ? (
          <div className="post__edit-form">
            <textarea
              className="post__edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
            />
            <div className="post__edit-actions">
              <button className="post__save-btn" onClick={handleSave}>Save</button>
              <button className="post__cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <p className="post__content">{post.content}</p>
        )}
      </div>

      {(post.imageUrl || post.image) && (
        <img
          src={post.imageUrl || post.image}
          alt=""
          className="post__image"
          loading="lazy"
        />
      )}

      <div className="post__footer">
        <button
          className={`post__reaction ${isLiked ? 'post__reaction--active' : ''}`}
          onClick={() => onLike && onLike(post._id)}
          disabled={!user}
        >
          {isLiked ? '❤️' : '🤍'} {likesCount}
        </button>
        <button
          className="post__reaction"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {commentsCount}
        </button>
      </div>

      {showComments && (
        <CommentList postId={post._id} />
      )}
    </article>
  );
}

export default Post;