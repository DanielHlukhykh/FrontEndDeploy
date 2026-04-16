import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllComments, createComment, updateComment, deleteComment } from '../../api/commentsApi';
import CommentItem from './CommentItem';
import './Comment.scss';

function CommentList({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  // Загружаем комментарии, фильтруя по post
  useEffect(() => {
    let cancelled = false;

    const fetchComments = async () => {
      try {
        // GET /api/comments?post=<postId>
        const data = await getAllComments({ post: postId });
        const list = Array.isArray(data) ? data : (data.comments || []);

        if (!cancelled) {
          // Фильтруем на клиенте на случай если бекенд не фильтрует
          const filtered = list.filter((c) => {
            const cPostId = typeof c.post === 'object' ? c.post._id : c.post;
            return cPostId === postId;
          });
          setComments(filtered);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComments();
    return () => { cancelled = true; };
  }, [postId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    try {
      const data = await createComment({
        post: postId,
        content: text.trim(),
      });

      // Бэкенд может вернуть customer/author как строку (ID),
      // подставляем данные текущего пользователя, чтобы имя сразу отображалось
      const enriched = {
        ...data,
        customer: data.customer && typeof data.customer === 'object'
          ? data.customer
          : {
              _id: user._id || user.id,
              login: user.login,
              firstName: user.firstName,
              lastName: user.lastName,
              avatarUrl: user.avatarUrl || user.avatar,
            },
        author: data.author && typeof data.author === 'object'
          ? data.author
          : undefined,
      };

      setComments((prev) => [...prev, enriched]);
      setText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    try {
      const data = await updateComment(commentId, { content: newContent });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? data : c))
      );
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (loading) {
    return <div className="comment-section"><p>Loading comments...</p></div>;
  }

  return (
    <div className="comment-section">
      <div className="comment-section__list">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {comments.length === 0 && (
          <p className="comment-section__empty">No comments yet. Be the first!</p>
        )}
      </div>

      {user && (
        <form className="comment-section__form" onSubmit={handleAdd}>
          <img
            src={user.avatarUrl || user.avatar || 'https://i.pravatar.cc/28'}
            alt=""
            className="comment-section__avatar"
          />
          <input
            type="text"
            className="comment-section__input"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="comment-section__send" disabled={!text.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}

export default CommentList;