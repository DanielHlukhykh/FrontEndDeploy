import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FollowerList.scss';

function FollowerList({ followers = [], onFollow, onUnfollow }) {
  const [search, setSearch] = useState('');

  const filtered = followers.filter((f) =>
    f.username.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFollow = (id, isFollowing) => {
    if (isFollowing) {
      onUnfollow && onUnfollow(id);
    } else {
      onFollow && onFollow(id);
    }
  };

  return (
    <div className="follower-list">
      <div className="follower-list__header">
        <h3 className="follower-list__title">👥 Followers ({followers.length})</h3>
        <input
          type="text"
          className="follower-list__search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="follower-list__items">
        {filtered.map((f) => (
          <div key={f._id} className="follower-list__item">
            <Link to={`/user/${f._id}`} className="follower-list__user">
              <img
                src={f.avatar || 'https://i.pravatar.cc/36?u=' + f._id}
                alt=""
                className="follower-list__avatar"
              />
              <div className="follower-list__info">
                <span className="follower-list__name">{f.username}</span>
                <span className="follower-list__bio">{f.bio || 'Fitness lover'}</span>
              </div>
            </Link>
            <button
              className={`follower-list__btn ${f.isFollowing ? 'follower-list__btn--following' : ''}`}
              onClick={() => toggleFollow(f._id, f.isFollowing)}
            >
              {f.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="follower-list__empty">No users found</p>
        )}
      </div>
    </div>
  );
}

export default FollowerList;