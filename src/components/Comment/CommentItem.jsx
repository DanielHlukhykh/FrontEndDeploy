import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import './Comment.scss';

function CommentItem({ comment, onEdit, onDelete }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');

  // Автор комментария — может быть в customer или author
  const rawAuthor = comment.customer || comment.author || {};
  const isPopulated = typeof rawAuthor === 'object' && rawAuthor !== null;
  const authorId = isPopulated ? rawAuthor._id : rawAuthor;

  // Если автор не распарсен (строка-ID) и это наш комментарий — используем данные текущего юзера
  const isSelf = user && (authorId === user._id || authorId === user.id);
  const author = isPopulated
    ? rawAuthor
    : isSelf
      ? user
      : {};

  const authorName =
    author.login ||
    `${author.firstName || ''} ${author.lastName || ''}`.trim() ||
    author.username ||
    'User';
  const authorAvatar = author.avatarUrl || author.avatar || '/default-avatar.png';

  const isOwner = user && (user._id === authorId || user.id === authorId);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(comment._id, editText.trim());
      setEditing(false);
    }
  };

  return (
    <div className="comment-item">
  <img src={authorAvatar} alt="" className="comment-item__avatar" />
      <div className="comment-item__body">
        <div className="comment-item__top">
          <span className="comment-item__author">{authorName}</span>
          <span className="comment-item__date">
            {formatDate(comment.date || comment.createdAt)}
          </span>
        </div>

        {editing ? (
          <div className="comment-item__edit">
            <input
              type="text"
              className="comment-item__edit-input"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="comment-item__edit-btns">
              <button onClick={handleSave}>✓</button>
              <button onClick={() => { setEditing(false); setEditText(comment.content || ''); }}>✕</button>
            </div>
          </div>
        ) : (
          <p className="comment-item__text">{comment.content}</p>
        )}

        {isOwner && !editing && (
          <div className="comment-item__actions">
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(comment._id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentItem;