import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllAwards } from '../../api/awardsApi';
import './PostForm.scss';

function PostForm({ onSubmit, awardId = null, placeholder = "What's your fitness update?" }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageMode, setImageMode] = useState('file'); // 'file' | 'url'
  const [selectedAward, setSelectedAward] = useState(awardId || '');
  const [userAwards, setUserAwards] = useState([]);
  const fileInputRef = useRef(null);

  // Загружаем награды пользователя
  useEffect(() => {
    if (!user) return;
    getAllAwards()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.awards || []);
        // Фильтруем только награды текущего пользователя
        const myAwards = list.filter((a) => {
          const aUserId = typeof a.user === 'object' ? a.user?._id : a.user;
          return aUserId === user._id;
        });
        setUserAwards(myAwards);
      })
      .catch(() => setUserAwards([]));
  }, [user]);

  if (!user) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl('');
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImageFile(null);
    setImagePreview(e.target.value || null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    let finalImageUrl = imageUrl.trim() || null;

    // Если выбран файл — конвертируем в base64 data URL
    if (imageFile) {
      finalImageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });
    }

    onSubmit({
      content: content.trim(),
      image: finalImageUrl,
      awardId: selectedAward || awardId,
    });

    setContent('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setShowImageInput(false);
    setSelectedAward('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form__top">
  <img src={user.avatarUrl || user.avatar || '/default-avatar.png'} alt="" className="post-form__avatar" />
        <textarea
          className="post-form__input"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
      </div>

      {showImageInput && (
        <div className="post-form__image-section">
          <div className="post-form__image-tabs">
            <button
              type="button"
              className={`post-form__image-tab ${imageMode === 'file' ? 'post-form__image-tab--active' : ''}`}
              onClick={() => setImageMode('file')}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              className={`post-form__image-tab ${imageMode === 'url' ? 'post-form__image-tab--active' : ''}`}
              onClick={() => setImageMode('url')}
            >
              🔗 Paste URL
            </button>
          </div>

          {imageMode === 'file' ? (
            <div className="post-form__file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="post-form__file-input"
                id="post-image-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="post-image-upload" className="post-form__file-label">
                {imageFile ? imageFile.name : 'Choose an image...'}
              </label>
            </div>
          ) : (
            <input
              type="url"
              className="post-form__url-input"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={handleUrlChange}
            />
          )}

          {imagePreview && (
            <div className="post-form__preview">
              <img src={imagePreview} alt="Preview" className="post-form__preview-img" />
              <button type="button" className="post-form__preview-remove" onClick={removeImage}>
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      <div className="post-form__bottom">
        <div className="post-form__bottom-left">
          <button
            type="button"
            className="post-form__media-btn"
            onClick={() => setShowImageInput(!showImageInput)}
          >
            📷 Photo
          </button>

          {userAwards.length > 0 && (
            <div className="post-form__award-select">
              <select
                value={selectedAward}
                onChange={(e) => setSelectedAward(e.target.value)}
                className="post-form__award-dropdown"
              >
                <option value="">🏆 Attach Award</option>
                {userAwards.map((award) => (
                  <option key={award._id} value={award._id}>
                    🏆 {award.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="post-form__submit" disabled={!content.trim()}>
          Post
        </button>
      </div>
    </form>
  );
}

export default PostForm;