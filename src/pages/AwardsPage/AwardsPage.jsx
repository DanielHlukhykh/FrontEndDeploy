import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllAwards, createAward, updateAward, deleteAward } from '../../api/awardsApi';
import { createPost } from '../../api/postsApi';
import AwardCard from '../../components/Awards/AwardCard';
import AwardForm from '../../components/Awards/AwardForm';
import PostForm from '../../components/Post/PostForm';
import Post from '../../components/Post/Post';
import './AwardsPage.scss';

function AwardsPage() {
  const { user } = useAuth();
  const [awards, setAwards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editAward, setEditAward] = useState(null);
  const [postAward, setPostAward] = useState(null);
  const [awardPosts, setAwardPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchAwards = async () => {
      try {
        const data = await getAllAwards();
        const allAwards = Array.isArray(data) ? data : (data.awards || []);
        const myAwards = allAwards.filter((a) => {
          const owner = a.customer || a.author || a.user || {};
          const ownerId = typeof owner === 'string' ? owner : owner._id;
          return ownerId === user._id;
        });
        setAwards(myAwards);
      } catch (err) {
        console.error('Failed to load awards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [user]);

  if (!user) {
    return <p className="awards-page__auth-msg">Please log in to manage your goals.</p>;
  }

  const handleCreate = async (formData) => {
    try {
      const data = await createAward(formData);
      setAwards((prev) => [...prev, data]);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create award:', err);
    }
  };

  const handleUpdate = async (formData) => {
    if (!editAward) return;
    try {
      const data = await updateAward(editAward._id, formData);
      setAwards((prev) => prev.map((a) => (a._id === editAward._id ? data : a)));
      setEditAward(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update award:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAward(id);
      setAwards((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error('Failed to delete award:', err);
    }
  };

  const handleStartEdit = (award) => {
    setEditAward(award);
    setShowForm(true);
    setPostAward(null);
  };

  const handlePostUpdate = (award) => {
    setPostAward(award);
    setShowForm(false);
    setEditAward(null);
  };

  const handlePostSubmit = async (formData) => {
    try {
      const postBody = {
        content: formData.content,
      };
      if (formData.image) postBody.imageUrl = formData.image;
      if (postAward?._id) postBody.award = postAward._id;

      const data = await createPost(postBody);
      setAwardPosts((prev) => [data, ...prev]);
      setPostAward(null);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const completedCount = awards.filter(
    (a) => (a.currentValue || 0) >= (a.targetValue || Infinity)
  ).length;

  return (
    <div className="awards-page">
      <div className="awards-page__header">
        <div>
          <h1 className="awards-page__title">🏆 Awards & Goals</h1>
          <p className="awards-page__subtitle">
            {awards.length} goals · {completedCount} completed
          </p>
        </div>
        <button
          className="awards-page__add-btn"
          onClick={() => { setShowForm(!showForm); setEditAward(null); }}
        >
          {showForm && !editAward ? '✕ Close' : '+ New Goal'}
        </button>
      </div>

      {showForm && (
        <AwardForm
          onSubmit={editAward ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditAward(null); }}
          editData={editAward}
        />
      )}

      {postAward && (
        <div className="awards-page__post-section">
          <h3>📝 Post update for: {postAward.title}</h3>
          <PostForm
            onSubmit={handlePostSubmit}
            awardId={postAward._id}
            placeholder={`Share progress for "${postAward.title}"...`}
          />
        </div>
      )}

      {loading ? (
        <div className="awards-page__empty"><p>Loading...</p></div>
      ) : (
        <div className="awards-page__grid">
          {awards.map((award) => (
            <AwardCard
              key={award._id}
              award={award}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
              onPostUpdate={handlePostUpdate}
            />
          ))}
        </div>
      )}

      {!loading && awards.length === 0 && !showForm && (
        <div className="awards-page__empty">
          <p>🎯 No goals yet. Create your first fitness goal!</p>
        </div>
      )}

      {awardPosts.length > 0 && (
        <div className="awards-page__posts">
          <h3>Recent Award Posts</h3>
          {awardPosts.map((p) => (
            <Post key={p._id} post={p} onLike={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AwardsPage;