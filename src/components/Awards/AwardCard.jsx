import React from 'react';
import './Awards.scss';

function AwardCard({ award, onEdit, onDelete, onPostUpdate }) {
  const currentValue = award.currentValue || 0;
  const targetValue = award.targetValue || 100;
  const progress = Math.min(Math.round((currentValue / targetValue) * 100), 100);
  const isCompleted = currentValue >= targetValue;

  return (
    <div className={`award-card ${isCompleted ? 'award-card--completed' : ''}`}>
      <div className="award-card__header">
        <span className="award-card__icon">{isCompleted ? '✅' : '🎯'}</span>
        <h3 className="award-card__title">{award.title}</h3>
      </div>

      {award.description && (
        <p className="award-card__desc">{award.description}</p>
      )}

      <div className="award-card__progress">
        <div className="award-card__bar">
          <div
            className="award-card__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="award-card__progress-text">
          {currentValue} / {targetValue} {award.unit || ''} ({progress}%)
        </span>
      </div>

      {(onEdit || onDelete || onPostUpdate) && (
        <div className="award-card__actions">
          {onPostUpdate && (
            <button className="award-card__btn" onClick={() => onPostUpdate(award)}>
              📝 Post
            </button>
          )}
          {onEdit && (
            <button className="award-card__btn" onClick={() => onEdit(award)}>
              ✏️ Edit
            </button>
          )}
          {onDelete && (
            <button className="award-card__btn award-card__btn--danger" onClick={() => onDelete(award._id)}>
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AwardCard;